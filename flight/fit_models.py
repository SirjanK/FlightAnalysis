import argparse
import pandas as pd
import itertools


# only fit models when we have enough delay > 0 data
DATA_SUPPORT_THRESHOLD = 200

CONDITIONAL_COLS = ['OP_CARRIER_AIRLINE_ID', 'ORIGIN_AIRPORT_ID', 'DEST_AIRPORT_ID', 'DEP_TIME_BUCKET']
DELAY_COL = 'ARR_DELAY'


def fit_models(df: pd.DataFrame) -> pd.DataFrame:
    """
    Learn exponential models for predicting flight delays. This model is actually a hybrid, we model the PDF as:
      * letting d := delay, c := context
        f(d|c) = { p * lambda * exp(-lambda * d), if d > 0 }; P(d <= 0|c) = 1 - p; in other words,
        f(d|c, d > 0) is modeled by an exponential distribution with parameter lambda, and P(d <= 0|c) is modeled by a Bernoulli distribution with parameter 1 - p
    We fit the parameters lambda and p by MLE given data:
      * p = # of delayed flights / # of total flights
      * lambda = 1 / mean(delay | delay > 0)
    
    :param df: DataFrame containing data we want to fit params to
    :return: DataFrame containing fitted params - columns are all the conditional columns with some being None (which means we marginalized across it)
             and the fitted params for the model for the conditional distribution of delay given the conditional columns
    """

    # group by the conditional columns and gather aggregate count, aggregate count of delay > 0, and sum of delay for those > 0
    agg_stats_df = df.groupby(CONDITIONAL_COLS).agg(
        count=pd.NamedAgg(column=DELAY_COL, aggfunc='count'),
        delayed_count=pd.NamedAgg(column=DELAY_COL, aggfunc=lambda x: (x > 0).sum()),
        sum_positive_delay=pd.NamedAgg(column=DELAY_COL, aggfunc=lambda x: x[x > 0].sum()),
    )
    agg_stats_df = agg_stats_df.reset_index()

    # iterate through subset size and gather data frames
    subset_dfs = []
    for subset_size in range(len(CONDITIONAL_COLS)):
        for subset_cols in itertools.combinations(CONDITIONAL_COLS, subset_size):
            # fit models on subset
            subset_dfs.append(aggregate_on_subset(agg_stats_df, list(subset_cols)))
    
    # concat all the subset data frames and agg_stats_df
    all_dfs = pd.concat(subset_dfs + [agg_stats_df], axis=0)

    # filter out rows where we don't have enough data support
    all_dfs = all_dfs[all_dfs['count'] >= DATA_SUPPORT_THRESHOLD]

    # compute fitted params columns
    all_dfs['p'] = all_dfs['delayed_count'] / all_dfs['count']
    all_dfs['lambda'] = all_dfs['delayed_count'] / all_dfs['sum_positive_delay']

    # only keep conditional columns and fitted params
    all_dfs = all_dfs[CONDITIONAL_COLS + ['p', 'lambda']]

    return all_dfs


def aggregate_on_subset(agg_stats_df: pd.DataFrame, subset_cols: list) -> pd.DataFrame:
    """
    Aggregate stats conditioned on a subset of the columns. This is useful for marginalizing out certain columns.
    We leverage the aggregate stats df from all conditional columns.

    :param agg_stats_df: DataFrame containing aggregate stats for all conditional columns
    :param subset_cols: List of columns to condition on
    :return: DataFrame containing aggregated stats for the subset of columns - other columns are set as None
    """

    subset_agg_stats_df = agg_stats_df
    if len(subset_cols) > 0:
        subset_agg_stats_df = subset_agg_stats_df.groupby(subset_cols)
    subset_agg_stats_df = subset_agg_stats_df.agg(
        count=pd.NamedAgg(column='count', aggfunc='sum'),
        delayed_count=pd.NamedAgg(column='delayed_count', aggfunc='sum'),
        sum_positive_delay=pd.NamedAgg(column='sum_positive_delay', aggfunc='sum'),
    )
    subset_agg_stats_df = subset_agg_stats_df.reset_index()

    # fill in None for the other subset columns
    for col in CONDITIONAL_COLS:
        if col not in subset_cols:
            subset_agg_stats_df[col] = None

    return subset_agg_stats_df


def deploy_models(params_df: pd.DataFrame, raw_lookup_tables_dir: str, deployment_path: str) -> None:
    """
    Deploy the model params to a file along with pruned lookup tables for airlines and airports.

    :params params_df: DataFrame containing fitted params - columns are all the conditional columns with some being None (which means we marginalized across it)
    :params raw_lookup_tables_dir: Path to the raw lookup tables directory
    :params deployment_path: Path to the assets directory
    """

    # save the params df
    params_df.to_csv(f"{deployment_path}/model_params.csv", index=False)

    # load the raw lookup tables
    airline_ids = pd.read_csv(f"{raw_lookup_tables_dir}/L_AIRLINE_ID.csv")
    airport_ids = pd.read_csv(f"{raw_lookup_tables_dir}/L_AIRPORT_ID.csv")

    # gather unique airline ids from params_df
    unique_airlines_ids = params_df['OP_CARRIER_AIRLINE_ID'].unique()
    # prune airline_ids to only contains those in unique_airlines_ids
    pruned_airline_ids = airline_ids[airline_ids['Code'].isin(unique_airlines_ids)]

    # gather unique airport ids from params_df
    unique_airport_ids = params_df[['ORIGIN_AIRPORT_ID', 'DEST_AIRPORT_ID']].stack().unique()
    # prune airport_ids to only contains those in unique_airport_ids
    pruned_airport_ids = airport_ids[airport_ids['Code'].isin(unique_airport_ids)]

    # save the pruned lookup tables
    pruned_airline_ids.to_csv(f"{deployment_path}/airline_id_lookup.csv", index=False)
    pruned_airport_ids.to_csv(f"{deployment_path}/airport_id_lookup.csv", index=False)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Fits models to flight delay data and deploys it to the assets directory')
    parser.add_argument('--input_data_path', type=str, help='Path to input data CSV')
    parser.add_argument('--raw_lookup_tables_dir', type=str, help='Path to raw lookup tables dir')
    parser.add_argument('--output_assets_dir', type=str, help='Path to output assets dir')

    args = parser.parse_args()

    data_df = pd.read_csv(args.input_data_path)
    print("Loaded data")
    params_df = fit_models(data_df)
    print(f"Size of params df: {len(params_df)}")
    deploy_models(params_df, args.raw_lookup_tables_dir, args.output_assets_dir)

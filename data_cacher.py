import pandas as pd
import argparse
import glob
import os
from typing import Optional


# threshold for minimum number of flights with delay to consider an airline, orig, or dest airport
MIN_FLIGHT_THRESHOLD = 200


# bucket the departure time into morning, afternoon, evening, and night
# range left inclusive, right exclusive
BUCKETS = {
    'morning': (600, 1200),
    'afternoon': (1200, 1800),
    'evening': (1800, 2400),
    'night': (0, 600),
}


def get_bucket(hour: Optional[float]) -> Optional[str]:
    """
    Get bucket for a given hour
    """

    if hour is None:
        return None
    for bucket, (start, end) in BUCKETS.items():
        if start <= hour < end:
            return bucket


def read_raw_data(data_dir: str) -> pd.DataFrame:
    """
    Read raw data from CSV files in data_dir
    :param data_dir: Directory containing raw data files
    :return: DataFrame containing raw data
    """

    path = os.path.join(data_dir, '*.csv')
    all_files = glob.glob(path)
    return pd.concat((pd.read_csv(f) for f in all_files), ignore_index=True)


def prune_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Prune data to only include rows and columns needed for analysis
    :param data: DataFrame containing raw data
    :return: DataFrame containing pruned data
    """

    # gather time bucket
    df['DEP_TIME_BUCKET'] = df['CRS_DEP_TIME'].apply(get_bucket)

    # filter out cancelled and departed flights
    filtered_df = df[(df['CANCELLED'] == 0) & (df['DIVERTED'] == 0)]

    # prune columns to what we need
    filtered_df = filtered_df[['OP_CARRIER_AIRLINE_ID', 'ORIGIN_AIRPORT_ID', 'DEST_AIRPORT_ID', 'DEP_TIME_BUCKET', 'ARR_DELAY']]

    # filter out rows with missing values
    filtered_df = filtered_df.dropna()

    # cast the OP_CARRIER_AIRLINE_ID to int
    filtered_df['OP_CARRIER_AIRLINE_ID'] = filtered_df['OP_CARRIER_AIRLINE_ID'].astype(int)

    # get positive delay data
    positive_delay_df = filtered_df[filtered_df['ARR_DELAY'] > 0]
    # for each airline, origin airport, and destination airport, get the count of flights - filter from filtered_df to remove those that have
    # < min flight threshold
    for conditional_col in ['OP_CARRIER_AIRLINE_ID', 'ORIGIN_AIRPORT_ID', 'DEST_AIRPORT_ID']:
        positive_delay_df = positive_delay_df[positive_delay_df.groupby(conditional_col)[conditional_col].transform('size') >= MIN_FLIGHT_THRESHOLD]
        filtered_df = filtered_df[filtered_df[conditional_col].isin(positive_delay_df[conditional_col].unique())]
    
    return filtered_df


def cache_data(df: pd.DataFrame, output_file_path: str) -> None:
    """
    Cache pruned data to a single output file
    :param df: DataFrame containing pruned data
    :param output_file_path: Path to output file
    """

    # create path to output file if it does not exist
    os.makedirs(os.path.dirname(output_file_path), exist_ok=True)

    # write to output file
    df.to_csv(output_file_path, index=False)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Prunes and caches data from raw flight CSVs to a single output file')
    parser.add_argument('--data_dir', type=str, help='Directory containing data files')
    parser.add_argument('--output_file_path', type=str, help='Path to output file')

    args = parser.parse_args()

    raw_df = read_raw_data(args.data_dir)
    print(f"Original num rows: {len(raw_df)}")
    pruned_df = prune_data(raw_df)
    print(f"Final num rows: {len(pruned_df)}")
    cache_data(pruned_df, args.output_file_path)

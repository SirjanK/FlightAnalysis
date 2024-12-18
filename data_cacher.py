import pandas as pd


# We omit certain conditioning variables if the count of the category is less than this threshold.
# As an example, if there is an origin airport with < this threshold of flights, we omit it.
MIN_THRESHOLD_COUNT_FOR_CONDITIONAL_VARIABLE = 500


def post_process_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Post-process the raw data by pruning certain conditional categories.

    :param df: Raw data
    :return: Post-processed df
    """

    pass


if __name__ == '__main__':
    raw_df = pd.read_csv('data.csv')  # TODO actually get df from the raw downloaded data once ready
    post_processed_df = post_process_data(raw_df)

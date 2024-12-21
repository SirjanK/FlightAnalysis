import numpy as np
from typing import Optional
import pandas as pd
from flight.fit_models import CONDITIONAL_COLS


class DelayCalculator:
    """
    The DelayCalculator manages the computation of predicted probability of delays given input configurations.
    """

    def __init__(self, params_df: pd.DataFrame) -> None:
        """
        Initialize the calculator with parameters data frame
        """

        # Cast columns to int with NaNs being ok
        for col in ['OP_CARRIER_AIRLINE_ID', 'ORIGIN_AIRPORT_ID', 'DEST_AIRPORT_ID']:
            params_df[col] = params_df[col].astype('Int64')
        self._params_df = params_df.set_index(CONDITIONAL_COLS)
    
    def validate(self, orig_airport_id: Optional[int], dest_airport_id: Optional[int], airline_id: Optional[int], time_bucket: Optional[str]) -> bool:
        """
        Validate we can support the query

        :param orig_airport_id: Origin airport ID.
        :param dest_airport_id: Destination airport ID.
        :param airline_id: Airline ID.
        :param hour_of_day: Hour of the day.
        :return: None if the query is supported, otherwise return an error message.
        """

        index = (airline_id, orig_airport_id, dest_airport_id, time_bucket)
        return index in self._params_df.index

    def predict_delays(self, orig_airport_id: Optional[int], dest_airport_id: Optional[int], airline_id: Optional[int], time_bucket: Optional[str]) -> Optional[np.ndarray]:
        """
        Predict delay probabilities given configurations.

        :param orig_airport_id: Origin airport ID.
        :param dest_airport_id: Destination airport ID.
        :param airline_id: Airline ID.
        :param hour_of_day: Hour of the day.
        :return: predicted probabilities of delays >= T. The array is of shape (T, 2) where T is the number of thresholds (i.e. delay durations)
                 arr[:, 0] is the delay duration, arr[:, 1] is the delay probability (1 - CDF).
                 if the query is not supported, return None.
        """

        print(f"Predicting delays for origin: {orig_airport_id}, destination: {dest_airport_id}, airline: {airline_id}, time_bucket: {time_bucket}")

        index = (airline_id, orig_airport_id, dest_airport_id, time_bucket)
        if index not in self._params_df.index:
            return None
        fitted_p = self._params_df.at[index, 'p']
        fitted_lambda = self._params_df.at[index, 'lambda']

        # 1 - CDF for delta > 0
        durations = np.linspace(start=0, stop=181, num=1801)
        probs = fitted_p * np.exp(-fitted_lambda * durations)

        return np.column_stack((durations, probs))

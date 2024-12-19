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

        self._params_df = params_df.index(CONDITIONAL_COLS)

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

        # get parameters
        fitted_p, fitted_lambda = self._params_df.loc[(orig_airport_id, dest_airport_id, airline_id, time_bucket), ['p', 'lambda']].get([0, 1], [None, None])

        if fitted_p is None or fitted_lambda is None:
            return None

        # 1 - CDF for delta > 0
        durations = np.linspace(start=0, stop=181, num=1801)
        probs = fitted_p * np.exp(-fitted_lambda * durations)

        return np.column_stack((durations, probs))

import numpy as np
from typing import Optional


class DelayCalculator:
    """
    The DelayCalculator manages the computation of predicted probability of delays given input configurations.
    """

    def __init__(self) -> None:
        pass

    def predict_delays(self, orig_airport_id: Optional[int], dest_airport_id: Optional[int], airline_id: Optional[int], hour_of_day: Optional[int]) -> np.ndarray:
        """
        Predict delay probabilities given configurations.

        :param orig_airport_id: Origin airport ID.
        :param dest_airport_id: Destination airport ID.
        :param airline_id: Airline ID.
        :param hour_of_day: Hour of the day.
        :return: predicted probabilities of delays >= T. The array is of shape (T, 2) where T is the number of thresholds (i.e. delay durations)
                 arr[:, 0] is the delay duration, arr[:, 1] is the delay probability (1 - CDF).
        """

        # TODO implement; fake plot for now
        durations = np.linspace(start=0, stop=180, num=1800)
        probs = 0.4 * np.exp(-0.01155245 * durations)

        return probs

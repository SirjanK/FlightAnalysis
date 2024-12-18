import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
from typing import Optional


URL = "https://www.transtats.bts.gov/DL_SelectFields.aspx?gnoyr_VQ=FGK&QO_fu146_anzr=b0-gvzr"

# Directory where the downloaded data will be saved
# unfortunately the safari web driver does not allow you to specify this to be another directory,
# o.w. it'd be cleaner. This works better if you clear your Downloads directory first
# also, the way it's implemented, you won't want to download other stuff to the directory while this
# script is running since we check for when a new file is available
DOWNLOAD_DIR = os.path.expanduser("~/Downloads")

# List of IDs for checkboxes we want to include in our download
OPTIONS = [
    "FL_DATE",
    "OP_CARRIER_AIRLINE_ID",
    "ORIGIN_AIRPORT_ID",
    "DEST_AIRPORT_ID",
    "CRS_DEP_TIME",
    "ARR_DELAY",
    "CANCELLED",
    "DIVERTED",
]

# YEAR to MONTH config - this allows us to be flexible for which months to download for year.
# Helps when we have to partially download data for a year.
YEAR_TO_MONTH_CONFIG = {
    # 2018: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    2018: [9, 10, 11, 12],
    2019: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    2020: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    2021: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    2022: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    2023: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    2024: [1, 2, 3, 4, 5, 6, 7, 8],  # only data up to Aug 2024
}


def get_files(download_dir: str) -> set:
    """Get the set of files in the download directory."""
    return set(os.listdir(download_dir))


def wait_for_download(download_dir: str, timeout: int = 300) -> Optional[str]:
    """
    Wait for download to complete.

    :param download_dir: Directory where the file is downloaded.
    :param timeout: Timeout in seconds.
    :return filename of the downloaded file if successful, None otherwise.
    """
    # initial set of files
    initial_files = get_files(download_dir)
    seconds = 0
    while seconds < timeout:
        time.sleep(5)
        for fname in get_files(download_dir) - initial_files:
            if fname.endswith(".csv"):  # we successfully downloaded a file
                return fname
        seconds += 5


def replace_file(old_file: str, download_dir: str, year: int, month: int) -> None:
    """
    Replace the old_file with a renamed version based on year and month.

    :param old_file: Old file name.
    :param download_dir: Directory where the file is downloaded.
    :param year: Year of the file.
    :param month: Month of the file.
    """
    old_fpath = os.path.join(download_dir, old_file)
    new_fpath = os.path.join(download_dir, f"T_ONTIME_MARKETING_{year}_{month}.csv")
    if os.path.exists(old_file):
        os.remove(old_file)


def scrape_data() -> None:
    """
    Scrape data from https://www.transtats.bts.gov/DL_SelectFields.aspx?gnoyr_VQ=FGK&QO_fu146_anzr=b0-gvzr by downloading
    flight delay data for all years and months.
    """
    # Set up the WebDriver for Safari
    driver = webdriver.Safari()

    try:
        # Applicable for all years and months
        # Navigate to the specified URL
        driver.get(URL)
        # Wait for the page to load and elements to be present
        wait = WebDriverWait(driver, 10)

        # Select parameters
        geography_dropdown = wait.until(EC.element_to_be_clickable((By.ID, "cboGeography")))
        geography_dropdown.send_keys("All")  # Select "All"

        # Check checkboxes (if applicable)
        for option in OPTIONS:
            checkbox = wait.until(EC.element_to_be_clickable((By.ID, option)))
            if not checkbox.is_selected():
                checkbox.click()

        for year in YEAR_TO_MONTH_CONFIG:
            for month in YEAR_TO_MONTH_CONFIG[year]:
                year_dropdown = wait.until(EC.element_to_be_clickable((By.ID, "cboYear")))
                year_dropdown.send_keys(str(year))

                period_dropdown = wait.until(EC.element_to_be_clickable((By.ID, "cboPeriod")))
                period_dropdown.send_keys(str(month))
 
                # Click on the Download button
                download_button = wait.until(EC.element_to_be_clickable((By.ID, "btnDownload")))
                download_button.click()

                # Wait for the download to complete
                tmp_file = wait_for_download(DOWNLOAD_DIR)
                if tmp_file is None:
                    print(f"DOWNLOAD FAILED FOR YEAR {year} AND MONTH {month}")
                else:
                    replace_file(tmp_file, DOWNLOAD_DIR, year, month)
                    print(f"DOWNLOADED FILE FOR YEAR {year} AND MONTH {month}")

                # bit of buffer time to not quickly re-click Download
                time.sleep(2)
    finally:
        # Close the driver
        driver.quit()


if __name__ == '__main__':
    scrape_data()

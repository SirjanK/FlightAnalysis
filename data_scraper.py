import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time


URL = "https://www.transtats.bts.gov/DL_SelectFields.aspx?gnoyr_VQ=FGK&QO_fu146_anzr=b0-gvzr"

# Directory where the downloaded data will be saved
# unfortunately the safari web driver does not allow you to specify this to be another directory,
# o.w. it'd be cleaner. This works better if you clear your Downloads directory first
# also, the way it's implemented, you won't want to download other stuff to the directory while this
# script is running since we check for when a new file is available
DOWNLOAD_DIR = os.path.expanduser("~/Downloads")

# List of IDs for checkboxes we want to include in our download
OPTIONS = [
    "DAY_OF_WEEK",
    "FL_DATE",
    "OP_CARRIER_AIRLINE_ID",
    "ORIGIN_AIRPORT_ID",
    "DEST_AIRPORT_ID",
    "CRS_DEP_TIME",
    "ARR_DELAY",
    "CANCELLED",
    "DIVERTED",
]

YEARS = [2018, 2019, 2020, 2021, 2022, 2023, 2024]
MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]


def get_files(download_dir: str) -> set:
    """Get the set of files in the download directory."""
    return set(os.listdir(download_dir))


def wait_for_download(download_dir: str, timeout: int = 300):
    """Wait for download to complete."""
    # initial set of files
    initial_files = get_files(download_dir)
    seconds = 0
    while seconds < timeout:
        time.sleep(5)
        for fname in get_files(download_dir) - initial_files:
            if fname.endswith(".csv"):  # we successfully downloaded a file
                return True
        seconds += 5
    return False


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
        driver.get("https://www.transtats.bts.gov/DL_SelectFields.aspx?gnoyr_VQ=FGK&QO_fu146_anzr=b0-gvzr")
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

        for year in YEARS:
            for month in MONTHS:
                if year == 2024 and month >= 12:
                    # We only have data up to November 2024 as of now
                    continue 

                year_dropdown = wait.until(EC.element_to_be_clickable((By.ID, "cboYear")))
                year_dropdown.send_keys(str(year))

                period_dropdown = wait.until(EC.element_to_be_clickable((By.ID, "cboPeriod")))
                period_dropdown.send_keys(str(month))
 
                # Click on the Download button
                download_button = wait.until(EC.element_to_be_clickable((By.ID, "btnDownload")))
                download_button.click()

                # Wait for the download to complete
                if wait_for_download(DOWNLOAD_DIR):
                    print(f"DOWNLOADED FILE FOR YEAR {year} AND MONTH {month}")
                else:
                    print(f"DOWNLOAD FAILED FOR YEAR {year} AND MONTH {month}")
    finally:
        # Close the driver
        driver.quit()


if __name__ == '__main__':
    scrape_data()

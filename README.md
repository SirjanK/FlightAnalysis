# Flight Delay Analysis
We play around with some flight delay data to analyze how it varies based on origin, destination, airline, and time of day.

Data from: https://www.transtats.bts.gov/DL_SelectFields.aspx?gnoyr_VQ=FGK&QO_fu146_anzr=b0-gvzr

## Analysis Notebook
See `FlightDelayAnalysis.ipynb` for some example analysis. Unzip `notebook_data.zip` to use the data referenced in the notebook in the first section.

For the second section for full data analysis, you'll need scraped data - reference `Data Scraper` section.

## Data Scraper
To use the full dataset, you can scrape data via `data_scraper.py` - update the `YEARS` and `MONTHS` in the custom there to download what you need
and see details and caveats in the comments in that file.
Invoke with:
```
python data_scraper.py --config [full, custom, test]
```
Recommend trying `test` first to make sure it works before going for `full` or `custom`.

Move your raw data from `Downloads` folder into some desired data directory.

## Web App
Run using `python app/run.py`. 

It allows optional user input for fields and computes the delays for `>= 30mins`, `>= 1hr`, `>= 2hrs` and plots `P(delay > T) vs T`.
The user can select which configurations for conditioning they want to see in the plot.

TODO: attach example image

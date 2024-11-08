# Visual Dash App - Music, Happiness & Mental Well-being Analysis

An interactive data visualization dashboard built with Dash and Plotly that explores the relationships between musical preferences, happiness levels, and mental well-being across different cultures.

## Features

- **Interactive Visualizations**: Explore correlations between music features and mental health metrics
- **Multi-dimensional Analysis**: Compare data across regions, demographics, and musical attributes
- **Responsive Design**: Modern, mobile-friendly interface using Dash Bootstrap Components
- **Rich Data Insights**: Statistical analysis and data summaries

## Key Components

1. **Music & Happiness Analysis**
   - Correlation heatmaps between music features and well-being metrics
   - Regional music characteristics comparison
   - Interactive scatter plots with trend lines

2. **Mental Health Quotient (MHQ) Analysis**
   - Radar charts for comparing MHQ dimensions across countries
   - Distribution analysis of mental health categories by region

3. **Demographics Analysis**
   - Age group trends across regions
   - Education level impact on mental well-being
   - Employment status correlations

4. **Interactive Data Explorer**
   - Custom visualization builder
   - Multiple chart types (scatter, box, bar, line)
   - Dynamic filtering and grouping options

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/visual-dash-app.git
   cd visual-dash-app
   ```

2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Run the application:
   ```
   python build/main.py
   ```

## Dependencies

- Python 3.8+
- Dash
- Plotly
- Pandas
- NumPy
- SciPy
- Dash Bootstrap Components

For a complete list of dependencies, see `requirements.txt`.

## Project Structure

```
visual-dash-app/
├── build/
│   ├── main.py           # Main application file
│   └── pages/            # Individual page layouts
│       ├── demographics.py
│       ├── explore.py
│       ├── mhq_analysis.py
│       └── music_happiness.py
├── data/
│   └── combined_data.csv # Dataset (not included in repo)
└── requirements.txt      # Project dependencies
```

## Usage

1. Navigate to `http://localhost:8050` after starting the application
2. Use the sidebar navigation to explore different analysis sections
3. Interact with visualizations using the provided controls
4. Hover over data points for detailed information
5. Use the Data Explorer for custom analysis

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Mental Health Million project for MHQ methodology
- Spotify API for music feature data
- World Happiness Report for happiness metrics
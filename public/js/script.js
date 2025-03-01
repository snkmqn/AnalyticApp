let chart;

async function fetchData() {
    const field = document.getElementById('field').value;
    const startDate = document.getElementById('start_date').value;
    const endDate = document.getElementById('end_date').value;

    if (!startDate || !endDate) {
        alert('Please select both start and end dates!');
        return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        alert('Invalid date format. Please select valid dates.');
        return;
    }

    if (end > today) {
        alert(`End date cannot exceed today's date: ${today.toLocaleDateString()}`);
        return;
    }

    if (start > end) {
        alert('Start date cannot be later than end date!');
        return;
    }

    try {
        const dataResponse = await fetch(`/api/measurements?field=${field}&start_date=${startDate}&end_date=${endDate}`);

        if (!dataResponse.ok) {
            const error = await dataResponse.json();
            alert(`Error fetching data: ${error.error || 'Unknown error occurred'}`);
            return;
        }

        const data = await dataResponse.json();

        if (data.length === 0) {
            alert('No data found for the selected range!');
            return;
        }

        const metricsResponse = await fetch(`/api/measurements/metrics?field=${field}`);

        if (!metricsResponse.ok) {
            const error = await metricsResponse.json();
            alert(`Error fetching metrics: ${error.error || 'Unknown error occurred'}`);
            return;
        }

        const metrics = await metricsResponse.json();

        document.getElementById('avg').innerText = `Average: ${metrics.avg}`;
        document.getElementById('min').innerText = `Minimum: ${metrics.min}`;
        document.getElementById('max').innerText = `Maximum: ${metrics.max}`;
        document.getElementById('stdDev').innerText = `Standard Deviation: ${metrics.stdDev}`;

        const timestamps = data.map(item => new Date(item.timestamp).toLocaleString());
        const fieldValues = data.map(item => item[field]);

        const fieldName = field.charAt(0).toUpperCase() + field.slice(1).replace("_", " ");

        if (chart) {
            chart.data.labels = timestamps;
            chart.data.datasets[0].data = fieldValues;
            chart.options.plugins.title.text = `Time Series for ${fieldName}`;
            chart.update({
                duration: 1200,
                easing: 'easeOutCubic',
            });
        } else {
            const ctx = document.getElementById('myChart').getContext('2d');
            chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: timestamps,
                    datasets: [{
                        label: fieldName,
                        data: fieldValues,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        fill: false
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: `Time Series for ${fieldName}`
                        }
                    },
                    animation: {
                        duration: 1200,
                        easing: 'easeOutCubic',
                    }
                }
            });
        }
    } catch (err) {
        console.error('Error fetching data:', err);
        alert('An error occurred while fetching data.');
    }
}

document.getElementById('getDataButton').addEventListener('click', fetchData);

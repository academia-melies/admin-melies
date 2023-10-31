import ReactApexChart from 'react-apexcharts';


const GraphChart = (props) => {

    const {
        options,
        type,
        series,
        height,
    } = props

    if (!options || !type || !series || !height) {
        return null;
    }

    return (
        <ReactApexChart
            options={options}
            type={type}
            series={series}
            height={height}
        />
    )
}

export default GraphChart;

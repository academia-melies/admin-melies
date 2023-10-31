import ReactApexChart from 'react-apexcharts';


const GraphChart = (props) => {

    const {
        options,
        type,
        series,
        height,
    } = props

    if (!options || !type || !series || !height) {
        return null; // ou qualquer comportamento adequado ao seu aplicativo
    }

    console.log(props)
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

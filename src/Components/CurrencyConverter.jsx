// src/CurrencyConverter.js
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { IoSwapVertical } from "react-icons/io5";
import Chart from 'chart.js/auto';

const CurrencyConverter = () => {

    const [currencyRates, setCurrencyRates] = useState({});
    const [baseCurrency, setBaseCurrency] = useState('USD');
    const [targetCurrency, setTargetCurrency] = useState('INR');
    const [amount, setAmount] = useState(1);
    const [convertedAmount, setConvertedAmount] = useState('');
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState(null);

    const chartRef = useRef(null); // Ref for the chart canvas

    useEffect(() => {
        const fetchRates = async () => {
            try {
                const response = await axios.get(
                    `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`
                );
                setCurrencyRates(response.data.rates);
                // Create chart data

                const labels = Object.keys(response.data.rates);
                const data = Object.values(response.data.rates);

                setChartData({
                    labels,
                    datasets: [
                        {
                            label: `${baseCurrency} to ${targetCurrency}`,
                            data,
                            borderColor: 'rgb(75, 192, 192)',
                            tension: 0.1,
                        },
                    ],
                });
            } catch (error) {
                console.error('Error fetching data:', error);
            }
            finally {
                setLoading(false);
            }
        };

        // Fetch rates initially
        fetchRates();

        // Set up refresh interval
        const interval = setInterval(fetchRates, 60000); // Refresh every minute

        // Clear interval on component unmount
        return () => clearInterval(interval);

    }, [baseCurrency, targetCurrency]);

    useEffect(() => {

        if (chartData) {
            if (chartRef.current !== null) {
                // If chart instance exists, destroy it
                chartRef.current.destroy();
            }
            // Create new chart instance
            const ctx = document.getElementById('myChart').getContext('2d');
            chartRef.current = new Chart(ctx, {
                type: 'line',
                data: chartData,
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                        },
                    },
                },
            });
        }
    }, [chartData]);

    // let myChart; // Chart instance

    const handleConvert = () => {
        const rate = currencyRates[targetCurrency];
        const result = (amount * rate).toFixed(2);
        setConvertedAmount(result);
    };

    const handleSwap = () => {
        // Swap base and target currencies
        setBaseCurrency(targetCurrency);
        setTargetCurrency(baseCurrency);
    };

    return (
        <>
            <div className='container'>
                <div className='row d-flex justify-content-center currency-converter'>
                    <div className='col-lg-6 col-md-8 col-sm-12 shadow rounded currency-converter-bg'>
                        <h2 className='text-center'>Currency Converter</h2>
                        <div>
                            <div>
                                <label htmlFor="inputCurrency" className="form-label">From</label>
                                <div className='d-flex'>
                                    <input
                                        type="number" className="form-control" id="inputCurrency"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                    />
                                    <select
                                        value={baseCurrency}
                                        onChange={(e) => setBaseCurrency(e.target.value)}
                                    >
                                        {Object.keys(currencyRates).map((currency) => (
                                            <option key={currency} value={currency}>
                                                {currency}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className='text-center'>
                                <button className='swap-btn mt-4' onClick={handleSwap}>Swap <IoSwapVertical /></button>
                            </div>

                            {loading ? ( // Conditional rendering for loading indicator
                                <p>Loading...</p>
                            ) : (
                                <div>
                                    <label htmlFor="outputCurrency" className="form-label">To</label>
                                    <div className='d-flex'>
                                        <input type="number" className="form-control" id="outputCurrency" value={convertedAmount} readOnly />
                                        <select
                                            value={targetCurrency}
                                            onChange={(e) => setTargetCurrency(e.target.value)}
                                        >
                                            {Object.keys(currencyRates).map((currency) => (
                                                <option key={currency} value={currency}>
                                                    {currency}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}

                            <div className='text-center'>
                                <button className='my-4 converter-btn' onClick={handleConvert}>Convert</button>
                            </div>

                        </div>
                    </div>
                </div >

                <div>
                    <canvas id="myChart" width="700" height="200"></canvas> {/* Chart canvas */}
                </div>

            </div >
        </>
    );
};

export default CurrencyConverter;

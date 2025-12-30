import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Line } from 'react-chartjs-2';
import { footprintApi } from '../api/footprintApi';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Calendar, ArrowUpRight, ArrowDownRight, Zap, Car, Loader, Leaf } from 'lucide-react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const History = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await footprintApi.getHistory();
                setHistory(data);
            } catch (error) {
                console.error('Failed to fetch history:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const chartData = {
        labels: history.map(item => item.date),
        datasets: [
            {
                label: 'Carbon Footprint (kg CO₂)',
                data: history.map(item => item.total),
                borderColor: 'rgb(16, 185, 129)',
                backgroundColor: 'rgba(16, 185, 129, 0.5)',
                tension: 0.3,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Your Carbon Footprint Trend',
            },
        },
        scales: {
            y: {
                beginAtZero: false,
            }
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader className="w-8 h-8 text-primary-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="text-center pb-6 border-b border-gray-200">
                <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">History & Progress</h2>
                <p className="mt-2 text-lg text-gray-600">Track your journey towards a greener lifestyle.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart Section */}
                <div className="lg:col-span-2">
                    <Card className="h-full shadow-md hover:shadow-lg transition-shadow duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900">Emission Trend</h3>
                            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Last 6 Months</span>
                        </div>
                        <div className="h-80">
                            <Line data={chartData} options={{ ...options, maintainAspectRatio: false }} />
                        </div>
                    </Card>
                </div>

                {/* Summary/Stats Section */}
                <div className="space-y-6">
                    <Card className="bg-white border border-gray-200 shadow-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Stats</h3>
                        <div className="space-y-6">
                            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                                <span className="text-gray-500">Total Calculations</span>
                                <span className="text-3xl font-bold text-gray-900">{history.length}</span>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Latest Footprint</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-bold text-primary-600">
                                        {history[history.length - 1]?.total.toLocaleString()}
                                    </span>
                                    <span className="text-gray-500">kg CO₂</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-primary-50 border-primary-100">
                        <div className="flex items-start gap-3">
                            <div className="bg-white p-2 rounded-lg shadow-sm">
                                <ArrowDownRight className="w-6 h-6 text-primary-600" />
                            </div>
                            <div>
                                <h4 className="font-bold text-primary-900">Keep it up!</h4>
                                <p className="text-sm text-primary-700 mt-1">
                                    Consistent tracking helps you stay aware and reduce your impact over time.
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* History List */}
            <div className="space-y-6 pt-8">
                <h3 className="text-2xl font-bold text-gray-900">Past Records</h3>
                <div className="grid gap-4">
                    {history.length === 0 ? (
                        <Card className="text-center py-12 bg-gray-50 border-dashed border-2 border-gray-200">
                            <div className="flex justify-center mb-4">
                                <div className="p-3 bg-white rounded-full shadow-sm">
                                    <Leaf className="w-8 h-8 text-gray-400" />
                                </div>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">No records yet</h3>
                            <p className="mt-1 text-gray-500">Start calculating your carbon footprint to see your history here.</p>
                            <div className="mt-6">
                                <Link to="/calculator">
                                    <Button>Calculate Now</Button>
                                </Link>
                            </div>
                        </Card>
                    ) : (
                        history.slice().reverse().map((record, index) => (
                            <Card key={record.id} className="flex flex-col md:flex-row justify-between items-center gap-6 hover:shadow-md transition-shadow duration-200 border-l-4 border-l-primary-500 group">
                                <div className="flex items-center gap-6 w-full md:w-auto">
                                    <div className="bg-primary-50 p-4 rounded-full group-hover:bg-primary-100 transition-colors">
                                        <Calendar className="w-6 h-6 text-primary-600" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 text-lg">{new Date(record.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                        <div className="flex gap-4 mt-1 text-sm text-gray-500">
                                            <span className="flex items-center gap-1" title="Electricity"><Zap className="w-3 h-3" /> {Math.round(record.breakdown.electricity)}</span>
                                            <span className="flex items-center gap-1" title="Transport"><Car className="w-3 h-3" /> {Math.round(record.breakdown.transport)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right w-full md:w-auto bg-gray-50 px-6 py-3 rounded-lg group-hover:bg-white transition-colors border border-transparent group-hover:border-gray-100">
                                    <p className="text-2xl font-bold text-gray-900">{record.total.toLocaleString()}</p>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">kg CO₂ / year</p>
                                </div>
                            </Card>
                        )))}
                </div>
            </div>
        </div>
    );
};

export default History;

import { useState, useEffect } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';
import { Card } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { footprintApi } from '../api/footprintApi';
import { Loader } from 'lucide-react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const Dashboard = () => {
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await footprintApi.getHistory();
                setHistory(data);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Calculate Pie Chart Data (Average breakdown)
    const calculatePieData = () => {
        if (!history.length) return { labels: [], datasets: [] };

        const totals = history.reduce((acc, curr) => {
            acc.electricity += curr.breakdown.electricity;
            acc.transport += curr.breakdown.transport;
            acc.diet += curr.breakdown.diet;
            acc.lifestyle += curr.breakdown.lifestyle;
            return acc;
        }, { electricity: 0, transport: 0, diet: 0, lifestyle: 0 });

        return {
            labels: ['Electricity', 'Transport', 'Diet', 'Lifestyle'],
            datasets: [
                {
                    data: [totals.electricity, totals.transport, totals.diet, totals.lifestyle],
                    backgroundColor: [
                        'rgba(255, 206, 86, 0.6)',
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(153, 102, 255, 0.6)',
                    ],
                    borderColor: [
                        'rgba(255, 206, 86, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                    ],
                    borderWidth: 1,
                },
            ],
        };
    };

    // Calculate Line Chart Data
    const calculateLineData = () => {
        return {
            labels: history.map(item => item.date),
            datasets: [
                {
                    label: 'Carbon Footprint (kg CO2)',
                    data: history.map(item => item.total),
                    borderColor: 'rgb(16, 185, 129)',
                    backgroundColor: 'rgba(16, 185, 129, 0.5)',
                    tension: 0.3,
                },
            ],
        };
    };

    const pieData = calculatePieData();
    const lineData = calculateLineData();

    const latest = history[history.length - 1];
    const totalFootprint = latest ? Math.round(latest.total) : 0;

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Footprint Trend',
            },
        },
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
            <div className="md:flex md:items-center md:justify-between">
                <div className="flex-1 min-w-0">
                    <h2 className="text-3xl font-bold leading-7 text-gray-900 sm:text-4xl sm:truncate tracking-tight">
                        Welcome back, <span className="text-primary-600">{user?.name}</span>!
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">Here's an overview of your carbon footprint impact.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <Card className="bg-gradient-to-br from-primary-500 to-primary-600 border-transparent text-white shadow-lg transform hover:scale-105 transition-transform duration-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="text-primary-100 font-medium text-sm uppercase tracking-wider">
                                Latest Footprint
                            </div>
                            <div className="mt-2 text-4xl font-extrabold text-white">
                                {totalFootprint.toLocaleString()} <span className="text-xl font-normal text-primary-200">kg CO₂</span>
                            </div>
                        </div>
                        <div className="bg-white/20 p-2 rounded-lg">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-primary-100">
                        <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-semibold mr-2">
                            {totalFootprint < 3000 ? 'Low Impact' : 'Needs Improvement'}
                        </span>
                        <span>{totalFootprint < 3000 ? 'Great job!' : 'Let\'s reduce it!'}</span>
                    </div>
                </Card>

                <Card className="hover:shadow-md transition-shadow duration-200 border-l-4 border-l-blue-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                                Total Records
                            </div>
                            <div className="mt-2 text-3xl font-bold text-gray-900">
                                {history.length}
                            </div>
                        </div>
                        <div className="bg-blue-50 p-2 rounded-lg">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    </div>
                    <div className="mt-4 text-sm text-blue-600 flex items-center">
                        <span>Track consistently</span>
                    </div>
                </Card>

                <Card className="hover:shadow-md transition-shadow duration-200 border-l-4 border-l-green-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                                Reduction Goal
                            </div>
                            <div className="mt-2 text-3xl font-bold text-gray-900">
                                -15%
                            </div>
                        </div>
                        <div className="bg-green-50 p-2 rounded-lg">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                    </div>
                    <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                    <div className="mt-1 text-xs text-gray-500 text-right">65% achieved</div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="hover:shadow-lg transition-shadow duration-200">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Emission Sources</h3>
                        <span className="text-sm text-gray-500">Average breakdown</span>
                    </div>
                    <div className="h-72 flex justify-center">
                        <Pie data={pieData} options={{ maintainAspectRatio: false }} />
                    </div>
                </Card>

                <Card className="hover:shadow-lg transition-shadow duration-200">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900">History Trend</h3>
                        <span className="text-sm text-gray-500">Over time</span>
                    </div>
                    <div className="h-72">
                        <Line options={options} data={lineData} />
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;

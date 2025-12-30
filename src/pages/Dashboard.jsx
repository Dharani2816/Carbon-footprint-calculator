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
import { Loader, Leaf } from 'lucide-react';

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
        <div className="space-y-8 animate-fade-in pb-8">
            <div className="md:flex md:items-end md:justify-between border-b border-gray-200 pb-6">
                <div className="flex-1 min-w-0">
                    <h2 className="text-3xl font-extrabold leading-7 text-gray-900 sm:text-4xl tracking-tight">
                        Dashboard
                    </h2>
                    <p className="mt-2 text-lg text-gray-500">
                        Welcome back, <span className="font-semibold text-primary-600">{user?.name}</span>! Here's your impact overview.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <Card className="bg-gradient-to-br from-primary-600 to-primary-800 border-transparent text-white shadow-xl shadow-primary-900/10 transform hover:-translate-y-1 transition-transform duration-300">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="text-primary-100 font-medium text-sm uppercase tracking-wider">
                                Latest Footprint
                            </div>
                            <div className="mt-2 text-5xl font-extrabold text-white tracking-tight">
                                {totalFootprint.toLocaleString()} <span className="text-2xl font-normal text-primary-200">kg</span>
                            </div>
                        </div>
                        <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                            <Leaf className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <div className="mt-6 flex items-center text-sm text-primary-50 font-medium">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold mr-2 ${totalFootprint < 3000 ? 'bg-green-400/20 text-white' : 'bg-red-400/20 text-white'}`}>
                            {totalFootprint < 3000 ? 'Low Impact' : 'Needs Action'}
                        </span>
                        <span>{totalFootprint < 3000 ? '🌿 Great job keeping it low!' : '⚠ Lets reduce this.'}</span>
                    </div>
                </Card>

                <Card className="hover:shadow-md transition-all duration-300 group">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                                Total Records
                            </div>
                            <div className="mt-2 text-4xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                                {history.length}
                            </div>
                        </div>
                        <div className="bg-blue-50 p-2.5 rounded-xl group-hover:bg-blue-100 transition-colors">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                        </div>
                    </div>
                    <div className="mt-6 text-sm text-gray-500">
                        Consistently tracking your footprint helps you stay aware.
                    </div>
                </Card>

                <Card className="hover:shadow-md transition-all duration-300 group">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                                Reduction Goal
                            </div>
                            <div className="mt-2 text-4xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                                65%
                            </div>
                        </div>
                        <div className="bg-green-50 p-2.5 rounded-xl group-hover:bg-green-100 transition-colors">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                    </div>
                    <div className="mt-4 w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div className="bg-green-500 h-2.5 rounded-full animate-slide-up" style={{ width: '65%' }}></div>
                    </div>
                    <div className="mt-2 text-xs font-semibold text-gray-500 text-right">Target reached</div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="hover:shadow-lg transition-shadow duration-300">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Emission Sources</h3>
                            <p className="text-sm text-gray-500">Where your emissions come from</p>
                        </div>
                    </div>
                    <div className="h-80 flex justify-center p-4">
                        <Pie data={pieData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
                    </div>
                </Card>

                <Card className="hover:shadow-lg transition-shadow duration-300">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">History Trend</h3>
                            <p className="text-sm text-gray-500">Your carbon footprint over time</p>
                        </div>
                    </div>
                    <div className="h-80 p-4">
                        <Line options={{ ...options, maintainAspectRatio: false }} data={lineData} />
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;

import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../../services/api';

export const ResultDetails = () => {
    const { id } = useParams();
    const [data, setData] = useState(null);

    useEffect(() => {
        api.get(`/student/results/${id}`)
            .then(res => setData(res.data))
            .catch(console.error);
    }, [id]);

    if (!data) return null;

    return (
        <div className="p-8 space-y-4">
            <h2 className="text-xl font-bold">{data.examTitle}</h2>

            {data.questions.map((q, i) => (
                <div key={i} className="border p-4 rounded-lg">
                    <h4>{i + 1}. {q.text}</h4>

                    {q.options.map((opt, idx) => (
                        <div
                            key={idx}
                            className={`p-2 rounded mt-1 ${idx === q.correctIndex
                                    ? 'bg-green-100'
                                    : idx === q.studentIndex
                                        ? 'bg-red-100'
                                        : ''
                                }`}
                        >
                            {opt}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

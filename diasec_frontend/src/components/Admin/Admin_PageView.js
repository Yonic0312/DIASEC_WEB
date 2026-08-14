import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const todayStr = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

const shiftDate = (dateStr, diff) => {
    const d = new Date(`${dateStr}T00:00:00`);
    d.setDate(d.getDate() + diff);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

const Admin_PageView = () => {
    const API = process.env.REACT_APP_API_BASE;
    const [date, setDate] = useState(todayStr);
    const [rows, setRows] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            setLoading(true);
            try {
                const { data } = await axios.get(`${API}/admin/visit/pages`, {
                    params: { date },
                    withCredentials: true,
                });
                if (cancelled) return;
                setRows(Array.isArray(data?.pages) ? data.pages : []);
                setTotal(Number(data?.total) || 0);
            } catch (err) {
                console.error('페이지 접속 통계 불러오기 실패', err);
                if (!cancelled) {
                    setRows([]);
                    setTotal(0);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        run();
        return () => { cancelled = true; };
    }, [API, date]);

    const maxCount = useMemo(
        () => Math.max(1, ...rows.map((r) => Number(r.viewCount ?? r.viewcount) || 0)),
        [rows]
    );

    return (
        <div className="flex-1 max-w-[1100px] pr-4 pb-20">
            <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">페이지 접속 통계</h1>
                <p className="mt-2 text-sm text-gray-600">
                    선택한 날짜에 사이트에서 열린 주소별 횟수입니다. 같은 사람이 여러 번 들어가도 모두 합산합니다.
                </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-6">
                <button
                    type="button"
                    onClick={() => setDate((d) => shiftDate(d, -1))}
                    className="px-3 py-1.5 rounded-md border border-gray-300 text-sm hover:border-[#D0AC88]"
                >
                    ◀ 하루 전
                </button>
                <input
                    type="date"
                    value={date}
                    max={todayStr()}
                    onChange={(e) => setDate(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-1.5 text-sm"
                />
                <button
                    type="button"
                    onClick={() => setDate((d) => shiftDate(d, 1))}
                    disabled={date >= todayStr()}
                    className="px-3 py-1.5 rounded-md border border-gray-300 text-sm hover:border-[#D0AC88] disabled:opacity-40"
                >
                    하루 후 ▶
                </button>
                <button
                    type="button"
                    onClick={() => setDate(todayStr())}
                    className="px-3 py-1.5 rounded-md border border-gray-300 text-sm hover:border-[#D0AC88]"
                >
                    오늘
                </button>
                <span className="ml-auto text-sm text-gray-700">
                    합계 <strong>{total.toLocaleString()}</strong>회
                </span>
            </div>

            {loading ? (
                <p className="text-sm text-gray-500">불러오는 중…</p>
            ) : rows.length === 0 ? (
                <p className="text-sm text-gray-500">이 날짜의 기록이 없습니다.</p>
            ) : (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr className="text-left text-gray-600">
                                <th className="px-3 py-2 font-semibold w-12">#</th>
                                <th className="px-3 py-2 font-semibold">주소</th>
                                <th className="px-3 py-2 font-semibold text-right w-28">횟수</th>
                                <th className="px-3 py-2 font-semibold w-[180px]">비율</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((r, i) => {
                                const count = Number(r.viewCount ?? r.viewcount) || 0;
                                const pct = total > 0 ? (count / total) * 100 : 0;
                                const bar = (count / maxCount) * 100;
                                return (
                                    <tr key={r.path} className="border-t border-gray-100">
                                        <td className="px-3 py-2 text-gray-500">{i + 1}</td>
                                        <td className="px-3 py-2 font-mono text-[13px] break-all">
                                            <Link
                                                to={r.path || '/'}
                                                className="text-[#a67a3e] hover:underline"
                                            >
                                                {r.path}
                                            </Link>
                                        </td>
                                        <td className="px-3 py-2 text-right tabular-nums font-medium">
                                            {count.toLocaleString()}
                                        </td>
                                        <td className="px-3 py-2">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-2 rounded bg-gray-100 overflow-hidden">
                                                    <div
                                                        className="h-full bg-[#D0AC88]"
                                                        style={{ width: `${bar}%` }}
                                                    />
                                                </div>
                                                <span className="w-12 text-right text-xs text-gray-500 tabular-nums">
                                                    {pct.toFixed(1)}%
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Admin_PageView;

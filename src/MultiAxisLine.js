import React, { useState, useEffect, useCallback } from 'react'
import { Chart } from 'react-charts'
import { Resizable } from "re-resizable";
import { CircularProgress } from '@material-ui/core';

export default function Line() {
    // series array
    const [isDataAvalible, setIsDataAvalible] = useState(false);
    const [dataSource, setDataSource] = useState();
    const [dataAvg, setDataAvg] = useState();
    const [data, setData] = useState();

    useEffect(() => {
        const fetchData = async () => {
            const res = await fetch('https://we.ahany.workers.dev/API')
            return res.ok && await res.json()
        }
        fetchData().then(res => {
            if (!res) return;
            setDataSource(res);
        });
    }, []);

    const getAvgFunction = useCallback((timeInterval, data) => {
        let lasttime = 0;
        let finalResult = [];
        let finalResultSpeed = [];
        Object.keys(data).forEach((number, i) => {
            finalResultSpeed.push({ label: "mb/min", data: [] })
            finalResult.push({ label: "hany", data: [] })
            Object.keys(data[number]).forEach((subscribtion) => {
                const subInfo = data[number][subscribtion];
                Object.keys(subInfo).forEach((time, index) => {

                    if (index !== 0) {
                        const start = new Date(lasttime * timeInterval);
                        const diff = Math.abs(new Date(time * timeInterval) - start);
                        const primary = new Date(start + diff / 2).getTime();
                        const minutes = Math.floor((diff / 1000 / 60));
                        const secondary = (subInfo[time] - subInfo[lasttime]) * 1000 / minutes;
                        finalResultSpeed[i].data.push({ primary, secondary })
                    }
                    lasttime = time
                    finalResult[i].data.push({ primary: time * timeInterval, secondary: subInfo[time] })
                })
            })
        })
        setData(finalResult)
        return finalResultSpeed;
    }, [setData]);

    useEffect(() => {
        if (!dataAvg) return;
        setIsDataAvalible(true);
    }, [dataAvg]);


    useEffect(() => {
        if (!dataSource) return;
        const { timeinterval, data } = dataSource;
        setDataAvg(getAvgFunction(timeinterval, data));
    }, [dataSource, getAvgFunction]);

    const series = React.useMemo(() => ({ showPoints: false }), [])
    const axes = React.useMemo(() => [{ primary: true, type: 'time', position: 'bottom' },
    { type: 'linear', position: 'left' }], [])

    return (
        <>
            {isDataAvalible ?
                <>
                    <br />
                    <Resizable defaultSize={{ width: "85vw", height: "45vw", }}>
                        <Chart data={dataAvg} series={series} axes={axes} tooltip dark />
                    </Resizable>
                    <br />
                    <br />
                    <Resizable defaultSize={{ width: "85vw", height: "45vw", }}>
                        <Chart data={data} series={series} axes={axes} tooltip dark />
                    </Resizable>
                    <br />
                </> :
                <>
                    <CircularProgress />
                </>
            }
        </>
    )
}
import React, { useState, useEffect, useCallback } from 'react'
import { Chart } from 'react-charts'
import { Resizable } from "re-resizable";
import { CircularProgress } from '@material-ui/core';
import Slider from '@material-ui/core/Slider';

export default function Line() {
    // series array
    const [isDataAvalible, setIsDataAvalible] = useState(false);
    const [dataSource, setDataSource] = useState();
    const [dataAvg, setDataAvg] = useState();
    const [data, setData] = useState();
    const [startDate, setStartDate] = React.useState();
    const [days, setDays] = React.useState(0);

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

    const getAvgFunction = useCallback((timeInterval, data, startDate) => {
        let lasttime = 0;
        let finalResultSpeed = [];
        Object.keys(data).forEach((number, i) => {
            finalResultSpeed.push({ label: "", data: [] })
            let dayNum = 0;
            Object.keys(data[number]).forEach((subscribtion) => {
                const subInfo = data[number][subscribtion];
                Object.keys(subInfo).filter((value) => value * timeInterval > startDate).forEach((time, index) => {
                    const current = new Date(time * timeInterval);
                    if (index !== 0) {
                        const start = new Date(lasttime * timeInterval);
                        const diff = Math.abs(current - start);
                        const minutes = Math.floor((diff / 1000 / 60));
                        const secondary = (subInfo[time] - subInfo[lasttime]) * 1000 / minutes;

                        // const timediff = new Date(start.getTime() + diff / 2)
                        // timediff.setSeconds(0)
                        // const primary = timediff.getTime();
                        finalResultSpeed[dayNum].data.push({ primary: start.getTime(), secondary })
                        finalResultSpeed[dayNum].data.push({ primary: current.getTime(), secondary })
                        if (start.getDay() !== current.getDay()) {
                            finalResultSpeed.push({ label: "", data: [] })
                            dayNum++
                            finalResultSpeed[dayNum].label = (current.getUTCDate() + 1).toString()
                            finalResultSpeed[dayNum].data.push({ primary: start.getTime(), secondary })
                            finalResultSpeed[dayNum].data.push({ primary: current.getTime(), secondary })
                        }
                    } else {
                        finalResultSpeed[dayNum].label = (current.getUTCDate()).toString()
                    }
                    lasttime = time
                })
            })
        })
        return finalResultSpeed;
    }, []);

    useEffect(() => {
        if (!dataSource) return;
        const { timeinterval, data } = dataSource;
        let finalResult = [];
        Object.keys(data).forEach((number, i) => {
            Object.keys(data[number]).forEach((subscribtion, j) => {
                finalResult.push({ label: 'start date ' + subscribtion, data: [] })
                const subInfo = data[number][subscribtion];
                Object.keys(subInfo).forEach((time) => {
                    finalResult[j].data.push({ primary: time * timeinterval, secondary: subInfo[time] })
                })
            })
        })
        setData(finalResult)
    }, [dataSource]);

    useEffect(() => {
        if (!dataAvg) return;
        setIsDataAvalible(true);
    }, [dataAvg]);


    useEffect(() => {
        if (!dataSource) return;
        const { timeinterval, data } = dataSource;
        setDataAvg(getAvgFunction(timeinterval, data, startDate));
    }, [dataSource, getAvgFunction, startDate]);

    const series = React.useMemo(() => ({ showPoints: false }), [])
    const axes = React.useMemo(() => [{ primary: true, type: 'time', position: 'bottom' },
        { type: 'linear', position: 'left' }], [])

    useEffect(() => {
        const date = new Date((new Date()).getTime() - days * 24 * 60 * 60 * 1000)
        date.setHours(0, 0, 0, 0);
        setStartDate(date);
    }, [days])

    const handleChange = (event, newValue) => {
        setDays(newValue);
    };

    return (
        <>
            {isDataAvalible ?
                <>
                    <p>Show data from Last </p>
                    <Slider min={0} max={30} value={days} onChange={handleChange}
                        style={{ width: "50vw" }} valueLabelDisplay="auto"
                        marks={[{ value: 0, label: 'today' }, { value: 7, label: 'week ago' },
                        { value: 30, label: 'month' }]} aria-labelledby="continuous-slider" />
                    <br />
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
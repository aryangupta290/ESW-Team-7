import React from "react";
import { Bar } from "react-chartjs-2";
import { Box, Button, Card, CardContent, CardHeader, Divider, useTheme } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";

export const HourVolFlow = (props) => {
  const theme = useTheme();
  const [data, setData] = React.useState({
    datasets: [
      {
        backgroundColor: "#3F51B5",
        barPercentage: 0.5,
        barThickness: 12,
        borderRadius: 4,
        categoryPercentage: 0.5,
        data: [18, 5, 19, 27, 29, 19, 20],
        label: "",
        maxBarThickness: 10,
      },
    ],
    labels: [
      "00:00",
      "01:00",
      "02:00",
      "03:00",
      "04:00",
      "05:00",
      "06:00",
      "07:00",
      "08:00",
      "09:00",
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
      "17:00",
      "18:00",
      "19:00",
      "20:00",
      "21:00",
      "22:00",
      "23:00",
    ],
  });

  const options = {
    animation: false,
    cornerRadius: 20,
    layout: { padding: 0 },
    legend: { display: false },
    maintainAspectRatio: false,
    responsive: true,
    xAxes: [
      {
        ticks: {
          fontColor: theme.palette.text.secondary,
        },
        gridLines: {
          display: false,
          drawBorder: false,
        },
      },
    ],
    yAxes: [
      {
        ticks: {
          fontColor: theme.palette.text.secondary,
          beginAtZero: true,
          min: 0,
        },
        gridLines: {
          borderDash: [2],
          borderDashOffset: [2],
          color: theme.palette.divider,
          drawBorder: false,
          zeroLineBorderDash: [2],
          zeroLineBorderDashOffset: [2],
          zeroLineColor: theme.palette.divider,
        },
      },
    ],
    tooltips: {
      backgroundColor: theme.palette.background.paper,
      bodyFontColor: theme.palette.text.secondary,
      borderColor: theme.palette.divider,
      borderWidth: 1,
      enabled: true,
      footerFontColor: theme.palette.text.secondary,
      intersect: false,
      mode: "index",
      titleFontColor: theme.palette.text.primary,
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };
  const [timeRange, setTimeRange] = React.useState({
    // set startTime to 00:00:00 of current day
    startTime: new Date(new Date().setHours(0, 0, 0, 0)),

    //    startTime: new Date(0),
  });
  const setStartTime = (e) => {
    if (e) setTimeRange({ ...timeRange, startTime: e });
    else
      setTimeRange({
        ...timeRange,
        startTime: new Date(new Date().setHours(0, 0, 0, 0)),
      });
  };

  const filterData = async () => {
    // extract data for that day
    const startTime = timeRange.startTime;
    //  console.log(startTime);
    const timeInterval = 60;
    // endTime is one day after startTime
    // set end time to two days ahead
    const endTime = new Date(startTime.getTime() + 1 * 24 * 60 * 60 * 1000);
    // console.log(startTime);
    // console.log(endTime);
    const url = `https://api.thingspeak.com/channels/"channel_id"/feeds.json?api_key="read_api_key"&start=${startTime.toISOString()}&end=${endTime.toISOString()}&results=1440&timezone=Asia%2FKolkata`;
    const [data1] = await Promise.all([fetch(url)]).then(async ([res]) => {
      const data1 = await res.json();
      return [data1];
    });
    //console.log(data1);
    const dataValue = data1.feeds.map((feed) => feed.field1);
    const timeFrame = data1.feeds.map((feed) => feed.created_at);
    let data = [];
    for (let i = 0; i < 24; i++) {
      data.push(0);
    }
    for (let i = 0; i < timeFrame.length; i++) {
      let date = new Date(timeFrame[i]);
      //

      let hour = date.getHours();
      if (dataValue[i] === null) continue;
      let value = Number(dataValue[i]);
      value = (value * timeInterval) / 1000;
      value = value.toFixed(2);
      data[hour] += Number(value);
      // data[hour] = data[hour].toFixed(2);
    }

    //console.log(data);
    // set data in datasets
    setData({
      datasets: [
        {
          backgroundColor: "#ffd699",
          barPercentage: 0.5,
          barThickness: 20,
          borderRadius: 4,
          categoryPercentage: 0.5,
          data: data,
          label: "",
          maxBarThickness: 30,
        },
      ],
      labels: [
        "00:00",
        "01:00",
        "02:00",
        "03:00",
        "04:00",
        "05:00",
        "06:00",
        "07:00",
        "08:00",
        "09:00",
        "10:00",
        "11:00",
        "12:00",
        "13:00",
        "14:00",
        "15:00",
        "16:00",
        "17:00",
        "18:00",
        "19:00",
        "20:00",
        "21:00",
        "22:00",
        "23:00",
      ],
    });
  };
  React.useEffect(() => {
    filterData();
  }, [timeRange]);

  return (
    <Card {...props}>
      <CardHeader
        title="HOUR-WISE VOLUME (L) "
        style={{ backgroundColor: "#ffa31a", color: "white" }}
      />
      <Divider />
      <CardContent>
        <Box
          sx={{
            height: 400,
            position: "relative",
          }}
        >
          <Bar data={data} options={options} />
        </Box>
      </CardContent>
      <Divider />
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          p: 2,
        }}
      >
        {" "}
        <div className="date-time">
          <p className="input-label">From: </p>
          <input onChange={(e) => setStartTime(e.target.valueAsDate)} type="date" />
          <div className="filler" />
        </div>
      </Box>
    </Card>
  );
};

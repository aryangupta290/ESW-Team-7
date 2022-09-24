import React, { useEffect } from "react";
// import use state
import { useState } from "react";
// import papa
import Papa from "papaparse";
import { Bar } from "react-chartjs-2";
import { Box, Button, Card, CardContent, CardHeader, Divider, useTheme } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import { parsePath } from "history";
function toJson(filepath) {
  return new Promise((resolve, reject) => {
    Papa.parse(filepath, {
      header: true,
      complete(results) {
        setParsedData(results.data);
      },
    });
  });
}
export const DayWiseGraph = (props) => {
  const theme = useTheme();
  const [data, setData] = React.useState({
    datasets: [
      {
        backgroundColor: "#3F51B5",
        barPercentage: 0.5,
        barThickness: 30,
        borderRadius: 4,
        categoryPercentage: 0.5,
        data: [],
        label: "",
        maxBarThickness: 30,
      },
    ],
    labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
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
  const filterData = async () => {
    // extract data for that day
    // get a week before that current day as start time
    const startTime = new Date();
    startTime.setDate(startTime.getDate() - 7);
    //  console.log(startTime);
    const timeInterval = 60 * 2;
    // endTime is one day after startTime
    // set end time to two days ahead
    const endTime = new Date();
    // console.log(startTime);
    // console.log(endTime);
    const url = `https://api.thingspeak.com/channels/1864037/feeds.json?api_key=IVVRQR3FGHLBA96G&start=${startTime.toISOString()}&end=${endTime.toISOString()}&timezone=Asia%2FKolkata`;
    const [data1] = await Promise.all([fetch(url)]).then(async ([res]) => {
      const data1 = await res.json();
      return [data1];
    });
    //console.log(data1);
    const dataValue = data1.feeds.map((feed) => feed.field1);
    const timeFrame = data1.feeds.map((feed) => feed.created_at);
    let data = [];
    // map monday to 0 and sunday to 6
    for (let i = 0; i < 7; i++) {
      data.push(0);
    }
    for (let i = 0; i < timeFrame.length; i++) {
      let date = new Date(timeFrame[i]);
      let day = date.getDay();
      if (dataValue[i] === null) continue;
      let value = Number(dataValue[i]);
      value = (value * timeInterval) / 1000;
      value = value.toFixed(2);
      data[day] += Number(value);
      // data[hour] = data[hour].toFixed(2);
    }

    //console.log(data);
    // set data in datasets
    setData({
      datasets: [
        {
          backgroundColor: "#66ff99",
          barPercentage: 0.5,
          barThickness: 40,
          borderRadius: 4,
          categoryPercentage: 0.5,
          data: data,
          label: "",
          maxBarThickness: 30,
        },
      ],
      labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    });
  };
  React.useEffect(() => {
    filterData();
  }, []);

  return (
    <Card {...props}>
      <CardHeader
        title="DAY-WISE VOLUME FLOW DURING LAST WEEK (L)"
        style={{ backgroundColor: "#39ac73", color: "white" }}
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
      ></Box>
    </Card>
  );
};

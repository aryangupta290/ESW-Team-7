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
  };
  const [parsedData, setParsedData] = useState([]);
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
  useEffect(() => {
    // give code to read data from csv file

    const f = async () => {
      // await for papa parse

      const data1 = await toJson("data.csv");

      //   const result = await Papa.parse("data.csv", {
      //     header: true,
      //     skipEmptyLines: true,
      //     complete: function (results) {
      //       // Parsed Data Response in array format
      //       setParsedData(results.data);
      //     },
      //   });
      console.log(parsedData);
      // go through the data
      let dayWiseValue = [];
      let dayWiseCount = [];
      let data = [];
      for (let i = 0; i < parsedData.length; i++) {
        //  console.log(parsedData[i].day);
      }
      setData({
        datasets: [
          {
            backgroundColor: "#3F51B5",
            barPercentage: 0.5,
            barThickness: 40,
            borderRadius: 4,
            categoryPercentage: 0.5,
            data: data,
            label: "",
            maxBarThickness: 30,
          },
        ],
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      });
    };

    f();
  }, []);
  return (
    <Card {...props}>
      <CardHeader
        title="DAY-WISE VOLUME FLOW DURING LAST WEEK"
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

import { Bar } from "react-chartjs-2";
import React from "react";
import { Box, Button, Card, CardContent, CardHeader, Divider, useTheme } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";

import {
  Chart,
  CategoryScale,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

// register chart elements
Chart.register(
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);
export const FlowRate = () => {
  const theme = useTheme();
  const options = {
    // add label to y axis
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

        // label on they axis
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
    // remove legend from chart plugins
    plugins: {
      legend: {
        display: false,
      },
    },
  };
  // timeFrame
  const [finalData, setFinalData] = React.useState({
    datasets: [
      {
        backgroundColor: "8233FF",
        barPercentage: 0.5,
        barThickness: 12,
        borderRadius: 4,
        categoryPercentage: 0.5,
        data: [],
      },
    ],
    labels: [],
  });
  const [timeRange, setTimeRange] = React.useState({
    // set start day to yesterday
    startTime: new Date(new Date().setDate(new Date().getDate() - 1)),
    //    startTime: new Date(0),
    endTime: new Date(),
  });

  const setStartTime = (e) => {
    if (e) setTimeRange({ ...timeRange, startTime: e });
    else
      setTimeRange({
        ...timeRange,
        startTime: new Date(new Date().setDate(new Date().getDate() - 1)),
      });
  };
  const setEndTime = (e) => {
    if (e) setTimeRange({ ...timeRange, endTime: e });
    else setTimeRange({ ...timeRange, endTime: new Date() });
  };

  // const data = {
  //   datasets: [
  //     {
  //       backgroundColor: "#3F51B5",
  //       barPercentage: 0.5,
  //       barThickness: 12,
  //       borderRadius: 4,
  //       categoryPercentage: 0.5,
  //       data: [18, 5, 19, 27, 29, 19, 20],
  //       label: "This year",
  //       maxBarThickness: 10,
  //     },
  //     {
  //       backgroundColor: "#EEEEEE",
  //       barPercentage: 0.5,
  //       barThickness: 12,
  //       borderRadius: 4,
  //       categoryPercentage: 0.5,
  //       data: [11, 20, 12, 29, 30, 25, 13],
  //       label: "Last year",
  //       maxBarThickness: 10,
  //     },
  //   ],
  //   labels: ["1 Aug", "2 Aug", "3 Aug", "4 Aug", "5 Aug", "6 Aug", "7 aug"],
  // };
  const filterData = async () => {
    // get data from start and end time
    // in url get the data from start to end time
    // const url = `http://localhost:3000/api/flowrate?start=${timeRange.startTime.toISOString()}&end=${timeRange.endTime.toISOString()}`;
    const url = `https://api.thingspeak.com/channels/1864037/feeds.json?api_key=IVVRQR3FGHLBA96G&average=10&start=${timeRange.startTime.toISOString()}&end=${timeRange.endTime.toISOString()}`;
    const [data1] = await Promise.all([fetch(url)]).then(async ([res]) => {
      const data1 = await res.json();
      return [data1];
    });
    console.log(data1);

    const dataValue = data1.feeds.map((feed) => feed.field1);
    const timeFrame = data1.feeds.map((feed) => feed.created_at);

    let labels = [];
    let data = [];
    let startTime = timeRange.startTime.getTime();
    let endTime = timeRange.endTime.getTime();
    for (let i = 0; i < timeFrame.length; i++) {
      let date = new Date(timeFrame[i]);
      let time = date.getTime();
      if (dataValue[i] === null) {
        continue;
      }
      // dataValue to number
      let value = Number(dataValue[i]);
      if (time >= startTime && time <= endTime) {
        // add 5:30 hrs into time
        var s = new Date(date).toLocaleString(undefined, {
          timeZone: "Asia/Kolkata",
        });
        labels.push(s);
        data.push(((value * 60) / 1000).toFixed(2));
      }
    }
    setFinalData({ ...finalData, labels: labels, datasets: [{ data: data }] });
  };
  // call filterData on load
  React.useEffect(() => {
    filterData();
  }, [timeRange]);

  return (
    <Card>
      <CardHeader
        title="Flow Rate (L/min)"
        style={{ backgroundColor: "#800080", color: "white" }}
      />
      <Divider />
      <CardContent>
        <Box
          sx={{
            height: 400,
            position: "relative",
          }}
        >
          <Line options={options} data={finalData} />
        </Box>
      </CardContent>

      <Divider />
      <Divider />
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          p: 2,
        }}
      >
        <div className="date-time">
          <p className="input-label">From: </p>
          <input onChange={(e) => setStartTime(e.target.valueAsDate)} type="date" />
          <div className="filler" />
          <p className="input-label">To: </p>
          <input onChange={(e) => setEndTime(e.target.valueAsDate)} type="date" />
        </div>
        <Button color="primary" endIcon={<ArrowRightIcon fontSize="small" />} size="small"></Button>
      </Box>
    </Card>
  );
};
// import { Bar } from 'react-chartjs-2';
// import { Box, Button, Card, CardContent, CardHeader, Divider, useTheme } from '@mui/material';
// import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
// import ArrowRightIcon from '@mui/icons-material/ArrowRight';

// export const Sales = (props) => {
//   const theme = useTheme();

//   const data = {
//     datasets: [
//       {
//         backgroundColor: '#3F51B5',
//         barPercentage: 0.5,
//         barThickness: 12,
//         borderRadius: 4,
//         categoryPercentage: 0.5,
//         data: [18, 5, 19, 27, 29, 19, 20],
//         label: 'This year',
//         maxBarThickness: 10
//       },
//       {
//         backgroundColor: '#EEEEEE',
//         barPercentage: 0.5,
//         barThickness: 12,
//         borderRadius: 4,
//         categoryPercentage: 0.5,
//         data: [11, 20, 12, 29, 30, 25, 13],
//         label: 'Last year',
//         maxBarThickness: 10
//       }
//     ],
//     labels: ['1 Aug', '2 Aug', '3 Aug', '4 Aug', '5 Aug', '6 Aug', '7 aug']
//   };

//   const options = {
//     animation: false,
//     cornerRadius: 20,
//     layout: { padding: 0 },
//     legend: { display: false },
//     maintainAspectRatio: false,
//     responsive: true,
//     xAxes: [
//       {
//         ticks: {
//           fontColor: theme.palette.text.secondary
//         },
//         gridLines: {
//           display: false,
//           drawBorder: false
//         }
//       }
//     ],
//     yAxes: [
//       {
//         ticks: {
//           fontColor: theme.palette.text.secondary,
//           beginAtZero: true,
//           min: 0
//         },
//         gridLines: {
//           borderDash: [2],
//           borderDashOffset: [2],
//           color: theme.palette.divider,
//           drawBorder: false,
//           zeroLineBorderDash: [2],
//           zeroLineBorderDashOffset: [2],
//           zeroLineColor: theme.palette.divider
//         }
//       }
//     ],
//     tooltips: {
//       backgroundColor: theme.palette.background.paper,
//       bodyFontColor: theme.palette.text.secondary,
//       borderColor: theme.palette.divider,
//       borderWidth: 1,
//       enabled: true,
//       footerFontColor: theme.palette.text.secondary,
//       intersect: false,
//       mode: 'index',
//       titleFontColor: theme.palette.text.primary
//     }
//   };

//   return (
//     <Card {...props}>
//       <CardHeader
//         action={(
//           <Button
//             endIcon={<ArrowDropDownIcon fontSize="small" />}
//             size="small"
//           >
//             Last 7 days
//           </Button>
//         )}
//         title="Latest Sales"
//       />
//       <Divider />
//       <CardContent>
//         <Box
//           sx={{
//             height: 400,
//             position: 'relative'
//           }}
//         >
//           <Bar
//             data={data}
//             options={options}
//           />
//         </Box>
//       </CardContent>
//       <Divider />
//       <Box
//         sx={{
//           display: 'flex',
//           justifyContent: 'flex-end',
//           p: 2
//         }}
//       >
//         <Button
//           color="primary"
//           endIcon={<ArrowRightIcon fontSize="small" />}
//           size="small"
//         >
//           Overview
//         </Button>
//       </Box>
//     </Card>
//   );
// };

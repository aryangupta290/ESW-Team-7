import React from "react";
// import math.js
import { Avatar, Box, Card, CardContent, Grid, Typography } from "@mui/material";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import MoneyIcon from "@mui/icons-material/Money";

// take data from index.js
// so in one query only get all the data hoully wise and calculate the volume
export const AvgDailyFlowRate = ({ data: { timeFrame, dataValue } }) => {
  let timeInterval;
  const [stats, setStats] = React.useState({
    dailyFlowRate: 0,
    difference: 0,
    Percentage: 0,
  });

  // For Flow Rate just get the average value

  React.useEffect(() => {
    //console.log(dataValue);
   // console.log(timeFrame);
    // get current and previous date
    let date = new Date();
    const currentDate = new Date();
    // previous date is yesterday
    const previousDate = new Date(currentDate);
    previousDate.setDate(currentDate.getDate() - 3);
    // const till = 60;
    // let url1 = `https://api.thingspeak.com/channels/1848152/feeds.json?api_key=F5QXETR9FEX2714N&start=${previousDate.toISOString()}&end=${currentDate.toISOString()}`;

    // const [data1] = await Promise.all([fetch(url1)]).then(async ([res1]) => {
    //   const data1 = await res1.json();
    //   return [data1];
    // });

    // let dataValue = data1.feeds.map((feed) => feed.field1);
    // let timeFrame = data1.feeds.map((feed) => feed.created_at);
    // dataValue = dataValue;
    // timeFrame = timeFrame;
    let dailyFlowRate = 0;
    let dailyFlowCount = 0;
    let prevFlowRate = 0;
    let prevFlowCount = 0;
    // calculate flow rate
    for (let i = 0; i < dataValue.length; i++) {
      // if timeframe within 24 hrs from current date
      let date2 = new Date(timeFrame[i]);
      if (dataValue[i] === null) {
        continue;
      }
      let diff = date.getTime() - date2.getTime();
      if (diff < 0) {
        continue;
      }
      // convert dataValue  to number
      let value = Number(dataValue[i]);
      if (diff <= 86400000) {
        dailyFlowRate += value;
        dailyFlowCount++;
      } else if (diff <= 2 * 86400000) {
        prevFlowRate += value;
        prevFlowCount++;
      }
    }
   // console.log(dailyFlowRate);
    dailyFlowRate = dailyFlowCount > 0 ? dailyFlowRate / dailyFlowCount : 0;
    dailyFlowRate = (dailyFlowRate * 60) / 1000;
    dailyFlowRate = dailyFlowRate.toFixed(2);
    prevFlowRate = prevFlowCount > 0 ? prevFlowRate / prevFlowCount : 0;
    prevFlowRate = (prevFlowRate * 60) / 1000;
    prevFlowRate = prevFlowRate.toFixed(2);
    let difference = dailyFlowRate - prevFlowRate;
    let percentage;
    if (dailyFlowRate == 0) {
      percentage = Math.abs(difference);
    } else {
      percentage = Math.abs((difference / dailyFlowRate) * 100);
    }

    percentage = percentage.toFixed(2);

    // set the stats
    setStats({
      dailyFlowRate,
      difference,
      percentage,
    });

    // get
  }, [dataValue, timeFrame]);
  // In thingspeak data is going ml/sec
  // display in L/min

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Grid container spacing={3} sx={{ justifyContent: "space-between" }}>
          <Grid item>
            <Typography color="textSecondary" gutterBottom variant="overline">
              Avg Daily Flow Rate
            </Typography>
            <Typography color="textPrimary" variant="h4">
              {stats.dailyFlowRate} L/min
            </Typography>
          </Grid>
          <Grid item>
            <Avatar
              sx={{
                backgroundColor: "error.main",
                height: 56,
                width: 56,
              }}
            >
              <MoneyIcon />
            </Avatar>
          </Grid>
        </Grid>
        <Box
          sx={{
            pt: 2,
            display: "flex",
            alignItems: "center",
          }}
        >
          <Typography
            color="error"
            sx={{
              mr: 1,
            }}
            variant="body2"
          ></Typography>
          {stats.difference > 0 ? (
            <ArrowUpwardIcon color="success" />
          ) : (
            <ArrowDownwardIcon color="error" />
          )}
          {stats.percentage}% from previous day
        </Box>
      </CardContent>
    </Card>
  );
};

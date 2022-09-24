import React from "react";
import { Avatar, Box, Card, CardContent, Grid, Typography } from "@mui/material";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import InsertChartIcon from "@mui/icons-material/InsertChartOutlined";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import MoneyIcon from "@mui/icons-material/Money";

export const DailyWaterVolume = ({ data: { timeFrame, dataValue } }) => {
  // how much data to extract from the api call// around 60*24 = 1440 data points
  const [stats, setStats] = React.useState({
    dailyWaterVolume: 0,
    difference: 0,
    percentage: 0,
  });
  React.useEffect(() => {
    // FORM URL GET LAST 2 DAYS DATA
    // const url = `https://api.thingspeak.com/channels/1848152/feeds.json?api_key=F5QXETR9FEX2714N&results=2880`;
    // const [data] = await Promise.all([fetch(url)]).then(async ([res]) => {
    //   const data = await res.json();
    //   return [data];
    // });
    // console.log(data);
    // Get total volume during last hour
    let dailyWaterVolume = 0;
    let prevDailyWaterVolume = 0;
    // get dataValue and TimeFrame
    // const dataValue = data.feeds.map((feed) => feed.field1);
    // const timeFrame = data.feeds.map((feed) => feed.created_at);
    const timeInterval = 2 * 60;
    for (let i = 0; i < dataValue.length; i++) {
      // if timeframe within 1 day from current date
      let date = new Date(timeFrame[i]);
      let diff = Date.now() - date.getTime();
      if (dataValue[i] === null) {
        continue;
      }
      if (diff < 0) {
        continue;
      }
      let value = Number(dataValue[i]);
      if (diff <= 86400000) {
        dailyWaterVolume += value; // ml/sec
      } else if (diff <= 2 * 86400000) {
        prevDailyWaterVolume += value;
      }
    }
    dailyWaterVolume = (dailyWaterVolume * timeInterval) / 1000;
    prevDailyWaterVolume = (prevDailyWaterVolume * timeInterval) / 1000;
    dailyWaterVolume = dailyWaterVolume.toFixed(2);
    prevDailyWaterVolume = prevDailyWaterVolume.toFixed(2);
    const difference = dailyWaterVolume - prevDailyWaterVolume;
    let percentage;
    if (dailyWaterVolume == 0) {
      percentage = (difference / 1).toFixed(2);
    } else {
      percentage = ((difference / dailyWaterVolume) * 100).toFixed(2);
    }
    // percentage is positive
    percentage = Math.abs(percentage);
    setStats({
      dailyWaterVolume,
      difference,
      percentage,
    });
  }, [dataValue, timeFrame]);

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Grid container spacing={3} sx={{ justifyContent: "space-between" }}>
          <Grid item>
            <Typography color="textSecondary" gutterBottom variant="overline">
              WATER WASTAGE DURING LAST DAY
            </Typography>
            <Typography color="textPrimary" variant="h4">
              {stats.dailyWaterVolume} L
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
          {stats.difference >= 0 ? (
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

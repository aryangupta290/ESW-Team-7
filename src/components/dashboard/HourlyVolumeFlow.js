import React from "react";
import { Avatar, Box, Card, CardContent, Grid, LinearProgress, Typography } from "@mui/material";
import InsertChartIcon from "@mui/icons-material/InsertChartOutlined";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import MoneyIcon from "@mui/icons-material/Money";

export const HourlyVolumeFlow = ({ data: { timeFrame, dataValue } }) => {
  const [stats, setStats] = React.useState({
    hourlyVolumeFlow: 0,
    difference: 0,
    percentage: 0,
  });
  React.useEffect(() => {
    // from url get around 250 data points
    // const url = `https://api.thingspeak.com/channels/1848152/feeds.json?api_key=F5QXETR9FEX2714N&results=121`;
    // const [data] = await Promise.all([fetch(url)]).then(async ([res]) => {
    //   const data = await res.json();
    //   return [data];
    //   // end
    // });
    // Get total volume during last hour
    let hourlyVolumeFlow = 0;
    let prevVolumeFlow = 0;
    // get dataValue and TimeFrame
    // const dataValue = data.feeds.map((feed) => feed.field1);
    // const timeFrame = data.feeds.map((feed) => feed.created_at);
    //console.log(dataValue);
    const timeInterval = 60;
    for (let i = 0; i < dataValue.length; i++) {
      // if timeframe within 1 hour from current date
      let date = new Date(timeFrame[i]);
      let diff = Date.now() - date.getTime();
      if (dataValue[i] === null) {
        continue;
      }
      // convert dataValue  to number
      let value = Number(dataValue[i]);
      if (diff < 0) {
        continue;
      }
      if (diff <= 3600000) {
        hourlyVolumeFlow += value;
      } else if (diff <= 2 * 3600000) {
        prevVolumeFlow += value;
      }
    }
    hourlyVolumeFlow = (hourlyVolumeFlow * timeInterval) / 1000;
    prevVolumeFlow = (prevVolumeFlow * timeInterval) / 1000;
    hourlyVolumeFlow = hourlyVolumeFlow.toFixed(2);
    prevVolumeFlow = prevVolumeFlow.toFixed(2);
    const difference = hourlyVolumeFlow - prevVolumeFlow;
    let percentage;
    if (hourlyVolumeFlow == 0) {
      percentage = (difference / 1).toFixed(2);
    } else {
      percentage = ((difference / hourlyVolumeFlow) * 100).toFixed(2);
    }
    // percentage is positive
    percentage = Math.abs(percentage);
    setStats({
      hourlyVolumeFlow,
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
              WATER WASTAGE DURING LAST HOUR
            </Typography>
            <Typography color="textPrimary" variant="h4">
              {stats.hourlyVolumeFlow} L
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
          {stats.percentage}% from previous hour
        </Box>
      </CardContent>
    </Card>
  );
};

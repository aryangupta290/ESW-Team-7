import React from "react";
import { Avatar, Box, Card, CardContent, Grid, Typography } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import PeopleIcon from "@mui/icons-material/PeopleOutlined";


export const CurrentFlowRate = ({ data: { timeFrame, dataValue } }) => {
  const [stats, setStats] = React.useState({
    currentFlowRate: 0,
  });
  React.useEffect(() => {
    // const url = `https://api.thingspeak.com/channels/1848152/feeds.json?api_key=F5QXETR9FEX2714N&results=1`;
    // const [data] = await Promise.all([fetch(url)]).then(async ([res]) => {
    //   const data = await res.json();
    //   return [data];
    // });
    // let currentFlowRate = data.feeds[0].field1;
    // if (currentFlowRate === null) {
    //   currentFlowRate = 0;
    // }
    let currentFlowRate = 0;
    for (let i = 0; i < dataValue.length; i++) {
      // get time difference
      let date = new Date(timeFrame[i]);
      let diff = Date.now() - date.getTime();
      if (dataValue[i] === null) {
        continue;
      }
      let value = Number(dataValue[i]);

      value = (value * 60) / 1000;
      if (diff < 0) {
        continue;
      }
      if (diff < 240*1000) {
        currentFlowRate = value;
        break;
      }

      break;
    }
    setStats({
      currentFlowRate: currentFlowRate,
    });
  }, [dataValue, timeFrame]);

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Grid container spacing={3} sx={{ justifyContent: "space-between" }}>
          <Grid item>
            <Typography color="textSecondary" gutterBottom variant="overline">
              Current Flow Rate
            </Typography>
            <Typography color="textPrimary" variant="h4">
              {stats.currentFlowRate} L/min
            </Typography>
          </Grid>
          <Grid item>
            <Avatar
              sx={{
                backgroundColor: "success.main",
                height: 56,
                width: 56,
              }}
            >
              <PeopleIcon />
            </Avatar>
          </Grid>
        </Grid>
        <Box
          sx={{
            alignItems: "center",
            display: "flex",
            pt: 2,
          }}
        ></Box>
      </CardContent>
    </Card>
  );
};

import Head from "next/head";
import useSWR from "swr";
import React from "react";
// import index.css
import axios from "axios";
import { Box, Container, Grid } from "@mui/material";

// import avgDailyFlowRate from budget.js

import { AvgDailyFlowRate } from "../components/dashboard/avgDailyFlowRate";
import { LatestOrders } from "../components/dashboard/latest-orders";
import { LatestProducts } from "../components/dashboard/latest-products";
import { FlowRate } from "../components/dashboard/FlowRate";
import { HourlyVolumeFlow } from "../components/dashboard/HourlyVolumeFlow";
import { CurrentFlowRate } from "../components/dashboard/currentFlowRate";
import { DailyWaterVolume } from "../components/dashboard/DailyWaterVolume";
import { TrafficByDevice } from "../components/dashboard/traffic-by-device";
import { DashboardLayout } from "../components/dashboard-layout";
import { DayWiseGraph } from "../components/dashboard/DayWisegraph";

// import vol Flow
// import currentFlowRate from currentFlowRate.js
import { VolFlow } from "../components/dashboard/volFlow";
import { HourVolFlow } from "../components/dashboard/HourWiseGraph";
import { format } from "date-fns";
const url1 =
  "https://api.thingspeak.com/channels/1864037/feeds.json?api_key=IVVRQR3FGHLBA96G&results=5000";

const Intervalms = 30 * 1000;
const Dashboard = () => {
  const fetcher = async (url) => await axios.get(url).then((res) => res.data);
  // fetch data from url1
  // useSWR to individually get data for each data
  const { data } = useSWR(url1, fetcher, {
    fallbackData: {
      feeds: [],
    },
    refreshInterval: Intervalms,
  });
  const formatData = () => {
    const timeFrame = data.feeds.map((feed) => feed.created_at);
    const dataValue = data.feeds.map((feed) => feed.field1);
    //  console.log(dataValue);
    return {
      timeFrame,
      dataValue,
    };
  };

  // all data
  return (
    <>
      <Container>
        <h1> Location : Water Coller at back of Vindhya Canteen</h1>
      </Container>
      <Head>
        <title>Dashboard | Material Kit</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth={false}>
          <Grid container spacing={3}>
            <Grid item lg={3} sm={6} xl={3} xs={12}>
              <AvgDailyFlowRate data={formatData()} />
            </Grid>
            <Grid item xl={3} lg={3} sm={6} xs={12}>
              <CurrentFlowRate data={formatData()} />
            </Grid>
            <Grid item xl={3} lg={3} sm={6} xs={12}>
              <HourlyVolumeFlow data={formatData()} />
            </Grid>
            <Grid item xl={3} lg={3} sm={6} xs={12}>
              <DailyWaterVolume data={formatData()} sx={{ height: "100%" }} />
            </Grid>

            <Grid item lg={12} md={12} xl={12} xs={12}>
              <FlowRate sx={{ height: "200%" }} />
            </Grid>
            <Grid item lg={12} md={12} xl={12} xs={12}>
              <VolFlow sx={{ height: "200%" }} />
            </Grid>
            <Grid item lg={12} md={12} xl={12} xs={12}>
              <HourVolFlow sx={{ height: "200%" }} />
            </Grid>
            <Grid item lg={12} md={12} xl={12} xs={12}>
              <DayWiseGraph sx={{ height: "200%" }} />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

Dashboard.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Dashboard;

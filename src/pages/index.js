import Head from "next/head";
import useSWR from "swr";
import React from "react";
// import index.css
import axios from "axios";
import { Box, Container, Grid } from "@mui/material";

// import avgDailyFlowRate from budget.js

import { AvgDailyFlowRate } from "../components/dashboard/avgDailyFlowRate";
import { FlowRate } from "../components/dashboard/FlowRate";
import { HourlyVolumeFlow } from "../components/dashboard/HourlyVolumeFlow";
import { CurrentFlowRate } from "../components/dashboard/currentFlowRate";
import { DailyWaterVolume } from "../components/dashboard/DailyWaterVolume";
import { DashboardLayout } from "../components/dashboard-layout";
import { DayWiseGraph } from "../components/dashboard/DayWisegraph";

// import vol Flow
// import currentFlowRate from currentFlowRate.js
import { VolFlow } from "../components/dashboard/volFlow";
import { HourVolFlow } from "../components/dashboard/HourWiseGraph";
import { format } from "date-fns";
const url1 =
  "https://api.thingspeak.com/channels/"channel_id"/feeds.json?api_key="read_api_key"&results=5000";

const Intervalms = 30 * 1000;

let p1 = 1721;
let p2 = 4999;

function gcd(a, h) {
  let temp;
  while (true) {
    temp = a % h;
    if (temp == 0) {
      return h;
    }
    a = h;
    h = temp;
  }
}

function addmod(x, y, n) {
  // Precondition: x<n, y<n
  // If it will overflow, use alternative calculation
  if (x + y <= x) x = x - ((n - y) % n);
  else x = (x + y) % n;
  return x;
}

function sqrmod(a, n) {
  var b;
  var sum = 0;

  // Make sure original number is less than n
  a = a % n;

  // Use double and add algorithm to calculate a*a mod n
  for (b = a; b != 0; b >>= 1) {
    if (b & 1) {
      sum = addmod(sum, a, n);
    }
    a = addmod(a, a, n);
  }
  return sum;
}

function powFun(base, ex, mo) {
  var r;
  if (ex === 0) return 1;
  else if (ex % 2 === 0) {
    r = powFun(base, ex / 2, mo) % mo;
    // return (r * r) % mo;
    return sqrmod(r, mo);
  } else return (base * powFun(base, ex - 1, mo)) % mo;
}
function getE(p1, p2) {
  let e = 3;
  let phi = (p1 - 1) * (p2 - 1);
  while (e < phi) {
    if (gcd(e, phi) == 1) break;
    else e += 1;
  }
  return e;
}

function Decrypt(encrypted_val, p1, p2, e) {
  let k = 2;
  let phi = (p1 - 1) * (p2 - 1);
  while ((1 + k * phi) % e != 0) {
    k += 1;
  }
  let d = (1 + k * phi) / e;
  return powFun(encrypted_val, d, p1 * p2);
}

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
    // convert dataValue to number
    let value = dataValue.map((val) => {
      return Decrypt(val, p1, p2, getE(p1, p2));
    });
    //  console.log(dataValue);
    return {
      timeFrame,
      dataValue,
      value,
    };
  };

  // all data
  return (
    <>
      <Container>
        <h1> Location : RO waste pipe at the back of Vindhya Canteen</h1>
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

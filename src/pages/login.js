import Head from "next/head";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Box, Button, Container, Grid, Link, TextField, Typography } from "@mui/material";

const Login = () => {
  const router = useRouter();
  // check if password if correct

  const formik = useFormik({
    initialValues: {
      password: "",
    },
    validationSchema: Yup.object({
      // password: Yup.string().max(255).required("Password is required"),
      // check if password is equal to "iiit123"
      password: Yup.string().oneOf(["iiit123"], "Password is incorrect"),
    }),
    onSubmit: () => {
      router.push("/");
    },
  });

  return (
    <>
      <Head>
        <title>Login | Material Kit</title>
      </Head>
      <Box
        component="main"
        sx={{
          alignItems: "center",
          display: "flex",
          flexGrow: 1,
          minHeight: "100%",
        }}
      >
        <Container maxWidth="sm">
          <form onSubmit={formik.handleSubmit}>
            <Box sx={{ my: 10 }}>
              <Typography color="textPrimary" variant="h4">
                Team 7 : Water Flow Monitoring System
              </Typography>
            </Box>

            <Box sx={{ my: 3 }}>
              <Typography color="textPrimary" variant="h4">
                Sign in with Password
              </Typography>
            </Box>

            <TextField
              error={Boolean(formik.touched.password && formik.errors.password)}
              fullWidth
              helperText={formik.touched.password && formik.errors.password}
              label="Password"
              margin="normal"
              name="password"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              type="password"
              value={formik.values.password}
              variant="outlined"
            />
            <Box sx={{ py: 2 }}>
              <Button
                color="primary"
                disabled={formik.isSubmitting}
                fullWidth
                size="large"
                type="submit"
                variant="contained"
              >
                Sign In Now
              </Button>
            </Box>
          </form>
        </Container>
      </Box>
    </>
  );
};

export default Login;

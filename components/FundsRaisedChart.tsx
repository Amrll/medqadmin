import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { collection, query, where, getDocs } from "firebase/firestore";
import { FIRESTORE_DB } from "@/lib/firebase";

const FundsRaisedComparisonChart = () => {
  const [loading, setLoading] = useState(true);
  const [totalFundsRaisedThisMonth, setTotalFundsRaisedThisMonth] = useState(0);
  const [totalFundsRaisedLastMonth, setTotalFundsRaisedLastMonth] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get current month's donations
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        const currentMonthDonationsQuery = query(
          collection(FIRESTORE_DB, "posts")
        );
        const currentMonthDonationsSnapshot = await getDocs(
          currentMonthDonationsQuery
        );
        const currentMonthDonations = currentMonthDonationsSnapshot.docs.map(
          (doc) => doc.data()
        );
        const totalFundsThisMonth = currentMonthDonations.reduce(
          (acc, donation) => acc + (donation.donatedAmount || 0),
          0
        );
        setTotalFundsRaisedThisMonth(totalFundsThisMonth);

        // Get last month's donations
        const lastMonth = currentMonth - 1 === 0 ? 12 : currentMonth - 1;
        const lastYear = lastMonth === 12 ? currentYear - 1 : currentYear;
        const lastMonthDonationsQuery = query(
          collection(FIRESTORE_DB, "posts"),
          where("createdAt", ">=", new Date(lastYear, lastMonth - 1, 1)),
          where("createdAt", "<", new Date(currentYear, currentMonth - 1, 1))
        );
        const lastMonthDonationsSnapshot = await getDocs(
          lastMonthDonationsQuery
        );
        const lastMonthDonations = lastMonthDonationsSnapshot.docs.map((doc) =>
          doc.data()
        );
        const totalFundsLastMonth = lastMonthDonations.reduce(
          (acc, donation) => acc + (donation.donatedAmount || 0),
          0
        );
        setTotalFundsRaisedLastMonth(totalFundsLastMonth);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Data for the line chart
  const chartData = {
    labels: ["Last Month", "This Month"],
    datasets: [
      {
        data: [totalFundsRaisedLastMonth, totalFundsRaisedThisMonth],
      },
    ],
  };

  return (
    <View>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <View>
          <Text style={styles.title}>Overview</Text>
          <View style={{justifyContent: 'center', flex: 1, alignItems: 'center'}}>
            <LineChart
              data={chartData}
              width={500}
              height={300}
              yAxisLabel="₱"
              yAxisSuffix=""
              chartConfig={{
                backgroundColor: "#3EB489",
                backgroundGradientFrom: "#3EB489",
                backgroundGradientTo: "#3EB489",
                decimalPlaces: 2,
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
});

export default FundsRaisedComparisonChart;

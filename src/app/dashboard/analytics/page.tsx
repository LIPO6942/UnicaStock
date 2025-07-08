'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { useState, useEffect } from "react";

const initialData = [
  { name: "Jan", total: 0 },
  { name: "Fev", total: 0 },
  { name: "Mar", total: 0 },
  { name: "Avr", total: 0 },
  { name: "Mai", total: 0 },
  { name: "Juin", total: 0 },
  { name: "Juil", total: 0 },
  { name: "Août", total: 0 },
  { name: "Sep", total: 0 },
  { name: "Oct", total: 0 },
  { name: "Nov", total: 0 },
  { name: "Déc", total: 0 },
];

export default function AnalyticsPage() {
    const [salesData, setSalesData] = useState(initialData);

    useEffect(() => {
        const generatedData = [
            { name: "Jan", total: Math.floor(Math.random() * 5000) + 1000 },
            { name: "Fev", total: Math.floor(Math.random() * 5000) + 1000 },
            { name: "Mar", total: Math.floor(Math.random() * 5000) + 1000 },
            { name: "Avr", total: Math.floor(Math.random() * 5000) + 1000 },
            { name: "Mai", total: Math.floor(Math.random() * 5000) + 1000 },
            { name: "Juin", total: Math.floor(Math.random() * 5000) + 1000 },
            { name: "Juil", total: Math.floor(Math.random() * 5000) + 1000 },
            { name: "Août", total: Math.floor(Math.random() * 5000) + 1000 },
            { name: "Sep", total: Math.floor(Math.random() * 5000) + 1000 },
            { name: "Oct", total: Math.floor(Math.random() * 5000) + 1000 },
            { name: "Nov", total: 4800 },
            { name: "Déc", total: Math.floor(Math.random() * 5000) + 1000 },
        ];
        setSalesData(generatedData);
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Analyses des Ventes</CardTitle>
                <CardDescription>Vue d'ensemble de vos revenus mensuels.</CardDescription>
            </CardHeader>
            <CardContent>
                 <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={salesData}>
                        <XAxis
                        dataKey="name"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        />
                        <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value / 1000}k TND`}
                        />
                         <Tooltip 
                            cursor={{fill: 'hsl(var(--muted))'}}
                            contentStyle={{backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))'}}
                         />
                        <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}

import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, Animated } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import { useTheme } from '../hooks/useTheme';
import { formatCurrency } from '../constants';

interface DataItem {
    name: string;
    population: number;
    color: string;
}

interface PieChartProps {
    data: DataItem[];
    width: number;
    height: number;
    innerRadius?: number;
    timeView?: 'daily' | 'weekly' | 'monthly';
    monthlyBudget?: number;
    totalDays?: number;
}

type InsightType = 'totalSpent' | 'topCategory' | 'averagePerDay' | 'budgetRemaining';

export const PieChart: React.FC<PieChartProps> = ({
    data,
    width,
    height,
    innerRadius = 0,
    timeView = 'monthly',
    monthlyBudget,
    totalDays = 30
}) => {
    const { theme } = useTheme();
    const [currentInsight, setCurrentInsight] = useState<InsightType>('totalSpent');
    const [fadeAnim] = useState(new Animated.Value(1));
    const total = data.reduce((sum, item) => sum + item.population, 0);
    const radius = Math.min(width, height) / 2;
    const centerX = width / 2;
    const centerY = height / 2;

    let currentAngle = 0;

    // Calculate insights
    const topCategory = data.length > 0 ? data.reduce((prev, current) => 
        prev.population > current.population ? prev : current
    ) : null;
    
    const topCategoryPercentage = topCategory ? (topCategory.population / total) * 100 : 0;
    const averagePerDay = totalDays > 0 ? total / totalDays : 0;
    const budgetRemaining = monthlyBudget ? monthlyBudget - total : null;

    // Determine default insight based on priority logic
    const getDefaultInsight = (): InsightType => {
        if (monthlyBudget && budgetRemaining !== null) {
            return 'budgetRemaining';
        }
        if (topCategoryPercentage >= 30) {
            return 'topCategory';
        }
        return 'totalSpent';
    };

    // Initialize with default insight on first render
    React.useEffect(() => {
        const defaultInsight = getDefaultInsight();
        if (currentInsight !== defaultInsight) {
            setCurrentInsight(defaultInsight);
        }
    }, [monthlyBudget, topCategoryPercentage]);

    const cycleInsights = () => {
        const insights: InsightType[] = ['totalSpent', 'topCategory', 'averagePerDay'];
        if (monthlyBudget) insights.push('budgetRemaining');
        
        const currentIndex = insights.indexOf(currentInsight);
        const nextIndex = (currentIndex + 1) % insights.length;
        
        // Animate transition
        Animated.sequence([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start();
        
        setTimeout(() => setCurrentInsight(insights[nextIndex]), 150);
    };

    const renderCenterLabel = () => {
        let mainText = '';
        let subText = '';
        let mainColor = theme.colors.text;

        switch (currentInsight) {
            case 'budgetRemaining':
                if (budgetRemaining !== null) {
                    mainText = formatCurrency(Math.abs(budgetRemaining));
                    subText = budgetRemaining >= 0 ? 'Remaining this month' : 'Over budget';
                    mainColor = budgetRemaining >= 0 ? theme.colors.success : theme.colors.error;
                }
                break;
            case 'totalSpent':
                mainText = formatCurrency(total);
                subText = `Spent this ${timeView === 'monthly' ? 'month' : timeView === 'weekly' ? 'week' : 'day'}`;
                break;
            case 'topCategory':
                if (topCategory) {
                    mainText = `${Math.round(topCategoryPercentage)}%`;
                    subText = `Top Spend\n${topCategory.name} · ${formatCurrency(topCategory.population)}`;
                }
                break;
            case 'averagePerDay':
                mainText = formatCurrency(averagePerDay);
                subText = 'Average per day';
                break;
        }

        if (!mainText) return null;

        return (
            <Animated.View 
                style={[
                    styles.centerLabel,
                    { 
                        opacity: fadeAnim,
                        width: innerRadius * 1.6,
                        height: innerRadius * 1.6,
                    }
                ]}
            >
                <Text style={[styles.mainText, { color: mainColor }]} numberOfLines={1} adjustsFontSizeToFit>
                    {mainText}
                </Text>
                <Text style={[styles.subText, { color: theme.colors.textSecondary }]} numberOfLines={3}>
                    {subText}
                </Text>
            </Animated.View>
        );
    };

    const createArc = (startAngle: number, endAngle: number, inner: number, outer: number) => {
        const start = polarToCartesian(centerX, centerY, outer, endAngle);
        const end = polarToCartesian(centerX, centerY, outer, startAngle);
        const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

        const start2 = polarToCartesian(centerX, centerY, inner, endAngle);
        const end2 = polarToCartesian(centerX, centerY, inner, startAngle);

        const d = [
            'M', start.x, start.y,
            'A', outer, outer, 0, largeArcFlag, 0, end.x, end.y,
            'L', end2.x, end2.y,
            'A', inner, inner, 0, largeArcFlag, 1, start2.x, start2.y,
            'Z'
        ].join(' ');

        return d;
    };

    const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
        const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
        return {
            x: centerX + (radius * Math.cos(angleInRadians)),
            y: centerY + (radius * Math.sin(angleInRadians))
        };
    };

    return (
        <TouchableOpacity 
            style={{ width, height, justifyContent: 'center', alignItems: 'center' }}
            onPress={cycleInsights}
            activeOpacity={0.8}
        >
            <Svg width={width} height={height}>
                <G>
                    {data.map((item, index) => {
                        if (item.population === 0) return null;

                        const sliceAngle = (item.population / total) * 360;
                        const endAngle = currentAngle + sliceAngle;

                        // Handle full circle case
                        if (Math.abs(sliceAngle - 360) < 0.01) {
                            return (
                                <Path
                                    key={index}
                                    d={`M ${centerX}, ${centerY - radius} A ${radius},${radius} 0 1,1 ${centerX},${centerY + radius} A ${radius},${radius} 0 1,1 ${centerX},${centerY - radius} Z`}
                                    fill={item.color}
                                />
                            );
                        }

                        const path = createArc(currentAngle, endAngle, innerRadius, radius);
                        currentAngle += sliceAngle;

                        return (
                            <Path
                                key={index}
                                d={path}
                                fill={item.color}
                            />
                        );
                    })}
                </G>
            </Svg>
            
            {/* Center Label */}
            {innerRadius > 0 && renderCenterLabel()}
        </TouchableOpacity>
    );
};
const styles = StyleSheet.create({
    centerLabel: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 1000,
        paddingHorizontal: 4,
    },
    mainText: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 2,
        minHeight: 22,
    },
    subText: {
        fontSize: 10,
        textAlign: 'center',
        lineHeight: 12,
        paddingHorizontal: 6,
        flexShrink: 1,
    },
});
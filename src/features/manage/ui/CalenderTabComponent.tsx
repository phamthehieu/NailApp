import { View, Text, Pressable, StyleSheet, LayoutChangeEvent } from "react-native"
import { Plus } from "lucide-react-native"
import { Colors, useAppTheme } from "@/shared/theme"
import React, { useState, useEffect, useMemo } from "react"
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated"
import { useTranslation } from "react-i18next"

type TabType = "Lịch trình" | "Danh sách"

interface CalenderTabComponentProps {
    activeTab?: TabType
    onTabChange?: (tab: TabType) => void
    onBookPress?: () => void
}

const CalenderTabComponent = ({
    activeTab = "Danh sách",
    onTabChange,
    onBookPress,
}: CalenderTabComponentProps) => {

    const { theme: { colors } } = useAppTheme()
    const { t } = useTranslation()

    const styles = $styles(colors)

    const tabs = useMemo(() => [t('calenderDashboard.calenderTab.schedule'), t('calenderDashboard.calenderTab.list')], [t]) as TabType[]

    const [dimensions, setDimensions] = useState({ height: 20, width: 100 })
    const selectedTabIndex = tabs.indexOf(activeTab) >= 0 ? tabs.indexOf(activeTab) : 0

    const buttonWidth = dimensions.width / tabs.length
    const padding = 10

    const tabPositionX = useSharedValue(buttonWidth * selectedTabIndex)

    useEffect(() => {
        if (dimensions.width > 0) {
            const newIndex = tabs.indexOf(activeTab) >= 0 ? tabs.indexOf(activeTab) : 0
            tabPositionX.value = withTiming(buttonWidth * newIndex)
        }
    }, [activeTab, buttonWidth, dimensions.width])

    const onTabbarLayout = (e: LayoutChangeEvent) => {
        const { width, height } = e.nativeEvent.layout
        setDimensions({ width, height })
        const index = tabs.indexOf(activeTab) >= 0 ? tabs.indexOf(activeTab) : 0
        tabPositionX.value = (width / tabs.length) * index
    }

    const handlePressCb = (index: number) => {
        onTabChange?.(tabs[index])
    }

    const onTabPress = (index: number) => {
        tabPositionX.value = withTiming(buttonWidth * index, {}, () => {
            runOnJS(handlePressCb)(index)
        })
    }

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: tabPositionX.value }],
        }
    })

    return (
        <View style={styles.container}>
            <View style={styles.contentContainer}>
                <View style={styles.segmentedControl}>
                    <Animated.View
                        style={[
                            animatedStyle,
                            styles.slidingTab,
                            {
                                height: dimensions.height - padding,
                                width: buttonWidth - padding,
                            },
                        ]}
                    />
                    <View onLayout={onTabbarLayout} style={styles.tabContainer}>
                        {tabs.map((tab, index) => {
                            const isActive = selectedTabIndex === index

                            return (
                                <Pressable
                                    key={tab}
                                    accessibilityRole="tab"
                                    onPress={() => onTabPress(index)}
                                    style={styles.tab}
                                >
                                    <Text
                                        style={[
                                            styles.tabText,
                                            isActive ? styles.tabTextActive : styles.tabTextInactive
                                        ]}
                                    >
                                        {tab}
                                    </Text>
                                </Pressable>
                            )
                        })}
                    </View>
                </View>

                <Pressable
                    style={styles.bookButton}
                    onPress={onBookPress}
                >
                    <Plus size={18} color={colors.white} />
                    <Text style={styles.bookButtonText}>{t('calenderDashboard.calenderTab.book')}</Text>
                </Pressable>
            </View>
        </View>
    )
}

const $styles = (colors: Colors) => StyleSheet.create({
    container: {
        backgroundColor: colors.background,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    segmentedControl: {
        flex: 1,
        borderRadius: 12,
        justifyContent: 'center',
        position: 'relative',
        maxWidth: 400,
        borderWidth: 1,
        borderColor: colors.border,
    },
    tabContainer: {
        flexDirection: 'row',
    },
    slidingTab: {
        backgroundColor: colors.yellow,
        borderRadius: 10,
        position: 'absolute',
        marginHorizontal: 5,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
    },
    tabTextActive: {
        color: colors.text,
    },
    tabTextInactive: {
        color: colors.text,
    },
    bookButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.yellow,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        gap: 6,
    },
    bookButtonText: {
        color: colors.white,
        fontSize: 14,
        fontWeight: '600',
    },
})

export default CalenderTabComponent;
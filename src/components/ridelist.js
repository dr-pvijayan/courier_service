import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Icon } from 'react-native-elements'
import { colors } from '../common/theme1';
import { language, dateStyle } from 'config';
import { useSelector } from 'react-redux';

export default function RideList(props) {

    const settings = useSelector(state => state.settingsdata.settings);

    const onPressButton = (item, index) => {
        props.onPressButton(item, index)
    }

    const renderData = ({ item, index }) => {
        return (
            <TouchableOpacity style={styles.iconClickStyle} onPress={() => onPressButton(item, index)}>
                <View style={styles.iconViewStyle}>
                <Icon 
                                name='motorcycle'
                                type='font-awesome'
                                color={colors.BLACK}
                                size={25}
                                containerStyle={styles.iconContainer}
                            />
                </View>
                <View style={styles.flexViewStyle}>
                    <View style={styles.textView1}>

                        <Text style={[styles.textStyle, styles.dateStyle]}>{item.bookingDate ? new Date(item.bookingDate).toLocaleString(dateStyle) : ''}</Text>
                        <Text style={[styles.textStyle, styles.carNoStyle]}>{item.carType ? item.carType : null} - {item.vehicle_number ? item.vehicle_number : language.no_delivery_assign}</Text>
                        <View style={[styles.picupStyle, styles.position]}>

                            <View style={styles.greenDot} />
                            <Text style={[styles.picPlaceStyle, styles.placeStyle]}>{item.pickup ? item.pickup.add : language.not_found_text}</Text>
                        </View>
                        <View style={[styles.dropStyle, styles.textViewStyle]}>
                            <View style={[styles.redDot, styles.textPosition]} />
                            <Text style={[styles.dropPlaceStyle, styles.placeStyle]}>{item.drop ? item.drop.add : language.not_found_text}</Text>
                        </View>

                    </View>
                    <View style={styles.textView2}>
                        <Text style={[styles.fareStyle, styles.dateStyle]}>{item.status == 'NEW' || item.status == 'PAYMENT_PENDING'? language[item.status] : null}</Text>
                        <Text style={[styles.fareStyle, styles.dateStyle]}>{item.status == 'PAID' || item.status == 'COMPLETE'? item.customer_paid ? settings.symbol + parseFloat(item.customer_paid).toFixed(2) : settings.symbol + parseFloat(item.estimate).toFixed(2) : null}</Text>
                        {
                            item.status == 'CANCELLED' ?
                                <Image
                                    style={styles.cancelImageStyle}
                                    source={require('../../assets/ImagesBacup/cancel.png')}
                                />
                                :
                                null
                        }
                    </View>
                </View>
            </TouchableOpacity>
        )
    }


    return (
        <View style={styles.textView3}>
            <FlatList
                keyExtractor={(item, index) => index.toString()}
                data={props.data}
                renderItem={renderData}
            />
        </View>
    );

};

const styles = StyleSheet.create({
    textStyle: {
        fontSize: 15,
    },
    fareStyle: {
        fontSize: 15,
    },
    carNoStyle: {
        marginLeft: 45,
        fontSize: 13,
        marginTop: 10
    },
    picupStyle: {
        flexDirection: 'row',
    },
    picPlaceStyle: {
        color: colors.GREY.secondary
    },
    dropStyle: {
        flexDirection: 'row',
    },
    drpIconStyle: {
        color: colors.RED,
        fontSize: 16
    },
    dropPlaceStyle: {
        color: colors.GREY.secondary
    },
    greenDot: {
        alignSelf: 'center',
        //borderRadius: 10,
        width: 12,
        height: 12,
        backgroundColor: colors.GREEN.default
    },
    redDot: {
        //borderRadius: 10,
        width: 12,
        height: 12,
        backgroundColor: colors.BLACK

    },
    logoStyle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    iconClickStyle: {
        flex: 1,
        flexDirection: 'row'
    },
    flexViewStyle: {
        flex: 7,
        flexDirection: 'row',
        borderBottomColor: colors.GREY.secondary,
        borderBottomWidth: 1,
        marginTop: 10,
        marginLeft: 5
    },
    dateStyle: {
        fontFamily: 'Ubuntu-Bold',
        color: colors.BLACK
    },
    carNoStyle: {
        fontFamily: 'Ubuntu-Regular',
        fontSize: 14,
        marginTop: 8,
        color: colors.GREY.secondary
    },
    placeStyle: {
        marginLeft: 10,
        fontFamily: 'Ubuntu-Regular',
        fontSize: 16,
        alignSelf: 'center'
    },
    textViewStyle: {
        marginTop: 10,
        marginBottom: 10
    },
    cancelImageStyle: {
        width: 40,
        height: 40,
        marginRight: 18,
        marginTop: 16,
        alignSelf: 'flex-end'

    },
    iconViewStyle: {
        flex: 1, marginTop: 10
    },
    textView1: {
        flex: 5
    },
    textView2: {
        flex: 2
    },
    textView3: {
        flex: 1
    },
    position: {
        marginTop: 10
    },
    textPosition: {
        alignSelf: 'center'
    }
});
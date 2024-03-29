import React, { useEffect, useState, useContext } from 'react';
import { Text, View, StyleSheet, Dimensions, FlatList, Modal, TouchableHighlight, TouchableWithoutFeedback, Switch, Image } from 'react-native';
import { Button, Header } from 'react-native-elements';
//import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { colors } from '../common/theme1';
import { language, dateStyle } from 'config';
import { useDispatch, useSelector } from 'react-redux';
import { FirebaseContext } from 'common/src';
import { Alert } from 'react-native';

var { width, height } = Dimensions.get('window');

export default function DriverTrips(props) {
    const { api } = useContext(FirebaseContext);
    const {
        acceptTask,
        cancelTask,
        updateProfile
    } = api;
    const dispatch = useDispatch();
    const tasks = useSelector(state => state.taskdata.tasks);
    const settings = useSelector(state => state.settingsdata.settings);
    const auth = useSelector(state => state.auth);
    const bookinglistdata = useSelector(state => state.bookinglistdata);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [activeBookings, setActiveBookings] = useState([]);

    useEffect(() => {
        if (bookinglistdata.bookings) {
            setActiveBookings(
                bookinglistdata.bookings.filter(booking =>
                    booking.status == 'ACCEPTED' ||
                    booking.status == 'ARRIVED' ||
                    booking.status == 'STARTED' ||
                    booking.status == 'REACHED'
                )
            )
        }
    }, [bookinglistdata.bookings])

    const onPressAccept = (item) => {
        let wallet_balance = parseFloat(auth.info.profile.walletBalance);
        if (wallet_balance >= 0) {
            if (wallet_balance == 0){
                Alert.alert(
                    language.alert,
                    language.wallet_balance_zero
                );
            }
            dispatch(acceptTask(auth.info, item));
            setSelectedItem(null);
            setModalVisible(null);
            setTimeout(() => {
                props.navigation.navigate('BookedDelivery', { bookingId: item.id });
            }, 3000)
        } else {
            Alert.alert(
                language.alert,
                language.wallet_balance_negative
            );
        }
    };

    const onPressIgnore = (id) => {
        dispatch(cancelTask(id));
        setSelectedItem(null);
        setModalVisible(null)
    };

    const goToBooking = (id) => {
        props.navigation.navigate('BookedDelivery', { bookingId: id });
    };

    const onChangeFunction = () => {
        let res = !auth.info.profile.driverActiveStatus;
        dispatch(updateProfile(auth.info, { driverActiveStatus: res }));
    }

    return (
        <View style={styles.mainViewStyle}>
            <Header
                backgroundColor={colors.LEYKO}
                leftComponent={{ icon: 'body-outline', type: 'ionicon', color: colors.BLACK, size: 30, component: TouchableWithoutFeedback, onPress: () => { props.navigation.toggleDrawer(); } }}
                centerComponent={<Text style={styles.headerTitleStyle}>{language.task_list}</Text>}
                containerStyle={styles.headerStyle}
                rightComponent={() => {
                    return (
                        <View style={{flexDirection:'row', alignItems:'center'}}>
                            <Text style={{color:colors.BLACK, fontWeight:'bold', marginRight:3}}>{language.on_duty}</Text>
                            <Switch
                                value={auth.info && auth.info.profile ? auth.info.profile.driverActiveStatus : false}
                                onValueChange={onChangeFunction}
                            />
                        </View>
                    );
                }}
                innerContainerStyles={styles.headerInnerStyle}
            />
            <FlatList
                data={auth.info && auth.info.profile && auth.info.profile.driverActiveStatus ?
                    (auth.info.profile.queue ? activeBookings : tasks) : []}
                keyExtractor={(item, index) => index.toString()}
                ListEmptyComponent={
                    <View style={{ flex: 1, backgroundColor:colors.LEYKO, justifyContent: "center", alignItems: "center", height: height }}>
                        <View>
                            <Image
                                source={require("../../assets/images/no_tasks.gif")}
                                resizeMode="contain"
                                style={{ height: 220, width: 220 }}
                            ></Image>
                        </View>
                        <View>
                            <Text style={styles.no_driver_style}>{
                                auth.info && auth.info.profile && auth.info.profile.driverActiveStatus ?
                                    language.dispatcher_not_here : language.service_off
                            }</Text>
                        </View>
                    </View>
                }
                renderItem={({ item, index }) => {
                    return (
                        <View style={styles.listItemView}>
                            {/* <View style={[styles.mapcontainer, activeBookings && activeBookings.length >= 1 ? { height: height - 400 } : null]}>
                                <MapView style={styles.map}
                                    provider={PROVIDER_GOOGLE}
                                    initialRegion={{
                                        latitude: item.pickup.lat,
                                        longitude: item.pickup.lng,
                                        latitudeDelta: activeBookings && activeBookings.length >= 1 ? 0.0922 : 0.0822,
                                        longitudeDelta: activeBookings && activeBookings.length >= 1 ? 0.0421 : 0.0321
                                    }}
                                >
                                    <Marker
                                        coordinate={{ latitude: item.pickup.lat, longitude: item.pickup.lng }}
                                        title={item.pickup.add}
                                        description={language.pickup_location}
                                        pinColor={colors.GREEN.light}
                                    />

                                    <Marker
                                        coordinate={{ latitude: item.drop.lat, longitude: item.drop.lng }}
                                        title={item.drop.add}
                                        description={language.drop_location}
                                    />

                                    <MapView.Polyline
                                        coordinates={item.coords}
                                        strokeWidth={4}
                                        strokeColor={colors.BLACK}
                                    />

                                </MapView>
                            </View> */}

                            <View style={styles.mapDetails}>
                                <View style={styles.dateView}>
                                    <Text style={styles.listDate}>{new Date(item.tripdate).toLocaleString(dateStyle)}</Text>
                                </View>
                                <View style={styles.estimateView}>
                                    <Text style={styles.listEstimate}>{item.estimateDistance? parseFloat(item.estimateDistance).toFixed(2): 0} {settings.convert_to_mile? language.mile : language.km}</Text>
                                    <Text style={styles.listEstimate}>{item.estimateTime? parseFloat(item.estimateTime/60).toFixed(0): 0} {language.mins}</Text>
                                </View>
                                <View style={styles.addressViewStyle}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <View style={styles.greenDot}></View>
                                        <Text style={styles.addressViewTextStyle}>{item.pickup.add}</Text>
                                    </View>
                                    <View style={styles.fixAdressStyle}>
                                        <View style={styles.redDot}></View>
                                        <Text style={styles.addressViewTextStyle}>{item.drop.add}</Text>
                                    </View>
                                </View>
                                <View style={styles.textContainerStyle}>
                                    <Text style={styles.textHeading}>{language.parcel_type} - </Text>
                                    <Text style={styles.textContent}>
                                        {item && item.parcelTypeSelected? item.parcelTypeSelected.description : ''}
                                    </Text>
                                </View>
                                <View style={styles.textContainerStyle}>
                                    <Text style={styles.textHeading}>{language.options} - </Text>
                                    <Text style={styles.textContent}>
                                        {item && item.optionSelected? item.optionSelected.description : ''}
                                    </Text>
                                </View>
                                <View style={styles.textContainerStyle2}>
                                    <Text style={styles.textHeading}>{language.pickUpInstructions}</Text>
                                    <Text style={styles.textContent2}>
                                        {item? item.pickUpInstructions : ''}
                                    </Text>
                                </View>
                                <View style={styles.textContainerStyle2}>
                                    <Text style={styles.textHeading}>{language.deliveryInstructions}</Text>
                                    <Text style={styles.textContent2}>
                                        {item? item.deliveryInstructions : ''}
                                    </Text>
                                </View>
                                <View style={styles.rateViewStyle}>
                                    <Text style={styles.rateViewTextStyle}>{settings.symbol}{item ? item.estimate > 0 ? parseFloat(item.estimate).toFixed(2) : 0 : null}</Text>
                                </View>
                                {activeBookings && activeBookings.length >= 1 ?
                                    <View style={styles.detailsBtnView}>
                                        <View style={{ flex: 1 }}>
                                            <Button
                                                onPress={() => {
                                                    goToBooking(item.id);
                                                }}
                                                title={language.go_to_booking}
                                                titleStyle={styles.titleStyles}
                                                buttonStyle={{
                                                    backgroundColor: colors.BLACK,
                                                    width: 180,
                                                    height: 50,
                                                    padding: 4,
                                                    borderColor: colors.TRANSPARENT,
                                                    borderWidth: 0,
                                                    borderRadius: 6,
                                                }}
                                                containerStyle={{
                                                    flex: 1,
                                                    alignSelf: 'center',
                                                    paddingRight: 14
                                                }}
                                            />
                                        </View>
                                    </View>
                                    :
                                    <View style={styles.detailsBtnView}>
                                        <View style={{ flex: 1 }}>
                                            <Button
                                                onPress={() => {
                                                    setModalVisible(true);
                                                    setSelectedItem(item);
                                                }}
                                                title={language.ignore_text}
                                                titleStyle={styles.titleStyles}
                                                buttonStyle={styles.myButtonStyle}
                                                containerStyle={{
                                                    flex: 1,
                                                    alignSelf: 'flex-end',
                                                    paddingRight: 14
                                                }}
                                            />
                                        </View>
                                        <View style={styles.viewFlex1}>
                                            <Button
                                                title={language.accept}
                                                titleStyle={styles.titleStyles}
                                                onPress={() => {
                                                    onPressAccept(item)
                                                }}
                                                buttonStyle={{
                                                    backgroundColor: colors.GREEN.light,
                                                    width: height / 6,
                                                    padding: 7,
                                                    borderColor: colors.TRANSPARENT,
                                                    borderWidth: 0,
                                                    borderRadius: 10,
                                                }}
                                                containerStyle={{
                                                    flex: 1,
                                                    alignSelf: 'flex-start',
                                                    paddingLeft: 14
                                                }}
                                            />
                                        </View>
                                    </View>
                                }
                            </View>
                        </View>
                    )
                }
                }
            />

            <View style={styles.modalPage}>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => {
                        Alert.alert(language.modal_close);
                    }}>
                    <View style={styles.modalMain}>
                        <View style={styles.modalContainer}>
                            <View style={styles.modalHeading}>
                                <Text style={styles.alertStyle}>{language.alert_text}</Text>
                            </View>
                            <View style={styles.modalBody}>
                                <Text style={{ fontSize: 16 }}>{language.ignore_job_title}</Text>
                            </View>
                            <View style={styles.modalFooter}>
                                <TouchableHighlight
                                    style={[styles.btnStyle, styles.clickText]}
                                    onPress={() => {
                                        setModalVisible(!modalVisible);
                                        setSelectedItem(null);
                                    }}>
                                    <Text style={styles.cancelTextStyle}>{language.cancel}</Text>
                                </TouchableHighlight>
                                <TouchableHighlight
                                    style={styles.btnStyle}
                                    onPress={() => {
                                        onPressIgnore(selectedItem.id)
                                    }}>
                                    <Text style={styles.okStyle}>{language.ok}</Text>
                                </TouchableHighlight>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </View>

    )




}

//Screen Styling
const styles = StyleSheet.create({
    headerStyle: {
        backgroundColor: colors.LEYKO,
        borderBottomWidth: 0
    },
    headerInnerStyle: {
        marginLeft: 10,
        marginRight: 10
    },
    headerTitleStyle: {
        color: colors.BLACK,
        fontFamily: 'Ubuntu-Bold',
        fontSize: 18
    },
    mapcontainer: {
        flex: 1.5,
        width: width,
        height: 220,
        borderWidth: 1,
        borderColor: colors.BLACK,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mapDetails: {
        backgroundColor: colors.WHITE,
        flex: 1,
        flexDirection: 'column',
    },
    map: {
        flex: 1,
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden'
    },
    triangle: {
        width: 0,
        height: 0,
        backgroundColor: colors.TRANSPARENT,
        borderStyle: 'solid',
        borderLeftWidth: 9,
        borderRightWidth: 9,
        borderBottomWidth: 10,
        borderLeftColor: colors.TRANSPARENT,
        borderRightColor: colors.TRANSPARENT,
        borderBottomColor: colors.BLACK,
        transform: [
            { rotate: '180deg' }
        ]
    },
    signInTextStyle: {
        fontFamily: 'Ubuntu-Bold',
        fontWeight: "700",
        color: colors.WHITE
    },
    listItemView: {
        flex: 1,
        width: '90%',
        //height: 360,
        marginBottom: 20,
        flexDirection: 'column',
        borderWidth:3,
        borderColor:"#107869",
        //backgroundColor:"#d1ebe9",
        borderRadius:20,
        alignSelf:"center",
        
   },
    dateView: {
        flex: 1.1
    },
    listDate: {
        fontSize: 18,
        fontWeight: 'bold',
        paddingLeft: 10,
        marginTop:10,
        color: colors.BLACK,
        flex: 1,
        alignSelf:'center'
    },
    estimateView:{
        flex: 1.1,
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-around',
        marginBottom:5,
        marginTop:10
    },
    listEstimate:{
        fontSize: 20,
        color: colors.GREY.secondary,
    },
    addressViewStyle: {
        flex: 2,
        paddingLeft: 13
    },
    no_driver_style: {
        color: colors.BLACK,
        fontSize: 20,
    },
    addressViewTextStyle: {
        color: colors.BLACK,
        fontSize: 15,
        marginLeft: 10,
        lineHeight: 20,
        flexWrap: "wrap",
    },
    greenDot: {
        backgroundColor: colors.GREEN.default,
        width: 14,
        height: 14,
        //borderRadius: 50
    },
    redDot: {
        backgroundColor: colors.BLACK,
        width: 14,
        height: 14,
        //borderRadius: 50
    },
    detailsBtnView: {
        flex: 2,
        justifyContent: 'space-between',
        flexDirection: 'row',
        width: width,
        marginTop: 20,
        marginBottom: 20,
        alignSelf:"center"
    },

    modalPage: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalMain: {
        flex: 1,
        backgroundColor: colors.WHITE,
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalContainer: {
        width: '80%',
        backgroundColor: colors.WHITE,
        borderRadius: 10,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 15,
        flex: 1,
        maxHeight: 180
    },
    modalHeading: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalBody: {
        flex: 2,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalFooter: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        borderTopColor: colors.GREY.iconPrimary,
        borderTopWidth: 1,
        width: '100%',
    },
    btnStyle: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mainViewStyle: {
        flex: 1,
        //marginTop: StatusBar.currentHeight
    },
    fixAdressStyle: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    myButtonStyle: {
        backgroundColor: colors.GREY.Deep_Nobel,
        width: height / 6,
        padding: 7,
        borderColor: colors.TRANSPARENT,
        borderWidth: 0,
        borderRadius: 10,
    },
    alertStyle: {
        fontWeight: 'bold',
        fontSize: 18,
        width: '100%',
        textAlign: 'center'
    },
    cancelTextStyle: {
        color: colors.BLUE.secondary,
        fontSize: 18,
        fontWeight: 'bold',
        width: "100%",
        textAlign: 'center'
    },
    okStyle: {
        color: colors.BLUE.secondary,
        fontSize: 18,
        fontWeight: 'bold'
    },
    viewFlex1: {
        flex: 1
    },
    clickText: {
        borderRightColor: colors.GREY.iconPrimary,
        borderRightWidth: 1
    },
    titleStyles: {
        width: "100%",
        alignSelf: 'center'
    },
    rateViewStyle: {
        alignItems: 'center',
        flex: 2,
        marginTop:3,
        marginBottom:3
    },
    rateViewTextStyle: {
        fontSize: 24,
        color: colors.BLACK,
        fontFamily: 'Ubuntu-Bold',
        fontWeight: 'bold',
        textAlign: "center"
    },
    textContainerStyle: {
        flexDirection: 'row',
        alignItems: "flex-start",
        marginLeft: 7,
        marginRight: 5,
        marginTop: 5
    },
    textContainerStyle2: {
        flexDirection: 'column',
        alignItems: "flex-start",
        marginLeft: 7,
        marginRight: 5,
        marginTop: 5
    },
    textHeading: {
        fontWeight: 'bold',
        color: colors.GREY.secondary,
        fontSize: 15,
    },
    textContent: {
        color: colors.GREY.secondary,
        fontSize: 15,
        marginLeft: 3,
    },
    textContent2: {
        marginTop: 4,
        color: colors.GREY.secondary,
        fontSize: 15
    },
});
import React,{useContext} from 'react';
import { Text, 
    View, 
    Dimensions, 
    StyleSheet, 
    FlatList, 
    Image, 
    TouchableOpacity,
    Linking,
    Share,
    Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Icon } from 'react-native-elements';
import { NavigationActions } from 'react-navigation';
import SideMenuHeader from './SideMenuHeader';
import { colors } from '../common/theme1';
var { width } = Dimensions.get('window');
import { useSelector, useDispatch } from "react-redux";
import { language } from 'config';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { FirebaseContext } from 'common/src';

const LOCATION_TASK_NAME = 'background-location-task';

export default function sideMenu(props){

    const { api } = useContext(FirebaseContext);
    const { signOut, updateProfile } = api;

    const dispatch = useDispatch();
    const auth = useSelector(state => state.auth);
    const settings = useSelector(state => state.settingsdata.settings);

    const sideMenuList = [
        {name: language.book_your_ride_menu, navigationName: 'Map', icon: 'plus', type: 'font-awesome'},
        {name: language.booking_request, navigationName: 'DriverTrips', icon: 'angle-double-right', type: 'font-awesome'},
        {name: language.my_rides_menu, navigationName: 'RideList', icon: 'motorcycle', type: 'font-awesome'},
        {name: language.incomeText, navigationName: 'MyEarning', icon: 'md-wallet', type: 'ionicon'},
        {name: language.my_wallet_menu, icon: 'account-balance-wallet', navigationName: 'wallet', type: 'MaterialIcons'},
        {name: language.profile_setting_menu, navigationName: 'Profile', icon: 'ios-person-add', type: 'ionicon'},
        {name: language.refer_earn, navigationName: 'Refer', icon: 'share-alt', type: 'font-awesome'},
        {name: language.about_us_menu, navigationName: 'About', icon: 'question-circle', type: 'font-awesome'},
        {name: language.logout, icon: 'sign-out',navigationName: 'Logout', type: 'font-awesome'}
    ];


    const StopBackgroundLocation = async () => {
        let res = !auth.info.profile.driverActiveStatus;
        dispatch(updateProfile(auth.info, { driverActiveStatus: res }));
        TaskManager.getRegisteredTasksAsync().then((res)=>{
            if(res.length>0){
                for(let i=0;i<res.length;i++){
                    if(res[i].taskName == LOCATION_TASK_NAME){
                        Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
                        break;
                    }
                }
            }
        });
    }

    //navigation to screens from side menu
    navigateToScreen = (route) => () => {
        const navigateAction = NavigationActions.navigate({
            routeName: route
        });
        props.navigation.dispatch(navigateAction);
    }
    
    //sign out 
    logOff = () => {
        auth.info && auth.info.profile && auth.info.profile.usertype == 'driver'?  StopBackgroundLocation():null;
        AsyncStorage.removeItem('firstRun');
        props.navigation.navigate('Intro');
        setTimeout(() => {
            dispatch(signOut());
        }, 1000); 
    }

    return (
        <View style={styles.mainViewStyle}>
            {auth.info && auth.info.profile?
                <SideMenuHeader headerStyle={styles.myHeader} userPhoto={auth.info.profile.profile_image} userEmail={auth.info.profile.email} userName={auth.info.profile.firstName + ' ' + auth.info.profile.lastName} ></SideMenuHeader>
            :null}
            <View style={styles.compViewStyle}>
                <View style={[styles.vertialLine, { height: (width <= 320) ? width / 1.53 : width / 1.68 }]}></View>
                {!!settings?
                <FlatList
                    data={sideMenuList}
                    keyExtractor={(item, index) => index.toString()}
                    style={{ marginTop: 20 }}
                    bounces={false}
                    renderItem={({ item, index }) => {
                        if (auth.info.profile.usertype == 'admin' && item.navigationName != 'About'  && item.navigationName != 'Logout' ) {
                            return null;
                        }   
                        else if (auth.info.profile.usertype == 'fleetadmin' && item.navigationName != 'About'  && item.navigationName != 'Logout' ) {
                            return null;
                        }   
                        else if (auth.info.profile.usertype == 'dispatcher' && (item.navigationName == 'DriverTrips' || item.navigationName == 'MyEarning')) {
                            return null;
                        }       
                        else if (auth.info.profile.usertype == 'driver' && ( item.navigationName == 'Map' || item.navigationName == 'Emergency')) {
                            return null;
                        } 
                        else if (!(auth.info.profile.usertype == 'dispatcher' || auth.info.profile.usertype == 'driver') && item.navigationName == 'Refer') {
                            return null;
                        }
                        else if ((auth.info.profile.usertype == 'dispatcher' || auth.info.profile.usertype == 'driver') && item.navigationName == 'Refer') {
                            return (
                                <TouchableOpacity 
                                    style={{marginLeft: 20}}
                                    onPress={()=>{
                                        settings.bonus>0?
                                        Share.share({
                                            message: language.share_msg + settings.code + ' ' + settings.bonus + ".\n"  +  language.code_colon +  auth.info.profile.referralId  + "\n" + language.app_link + (Platform.OS=="ios"? settings.AppleStoreLink : settings.PlayStoreLink)
                                        })
                                        :
                                        Share.share({
                                            message: language.share_msg_no_bonus + "\n"  + language.app_link + (Platform.OS=="ios"? settings.AppleStoreLink : settings.PlayStoreLink)
                                        })
                                    }}
                                    style={
                                        [styles.menuItemView, { marginTop: (index == sideMenuList.length - 1) ? width / 7 : 0 }]
                                    }>
                                    <View style={styles.viewIcon}>
                                        <Icon
                                            name={item.icon}
                                            type={item.type}
                                            color={colors.GREEN.default}
                                            size={23}
                                            containerStyle={styles.iconStyle}
                                        />
                                    </View>
                                    <Text style={styles.menuName}>{item.name}</Text>
                                </TouchableOpacity>
                            );                         
                        }else{
                            return(
                            <TouchableOpacity
                                onPress={
                                    (item.name == language.logout) ? () => logOff() :
                                        navigateToScreen(item.navigationName)
                                }
                                style={
                                    [styles.menuItemView, { marginTop: (index == sideMenuList.length - 1) ? width / 40 : 0 }]
                                }>
                                <View style={styles.viewIcon}>
                                    <Icon
                                        name={item.icon}
                                        type={item.type}
                                        color={colors.GREEN.default}
                                        size={23}
                                        containerStyle={styles.iconStyle}
                                    />
                                </View>
                                <Text style={styles.menuName}>{item.name}</Text>
                            </TouchableOpacity>
                            )
                        }
                    }
                    } />
                :null}
            </View>
            {/* <View>
                <Image
                    source={require("../../assets/ImagesBacup/logo165x90white.png")}
                    style={{ width: '90%', marginBottom:10 }}
                />
            </View> */}

        </View>
    )
    
}
const styles = StyleSheet.create({
    myHeader: {
        marginTop: 0,
    },
    vertialLine: {
        width: 0,
        backgroundColor: colors.GREY.btnPrimary,
        position: 'absolute',
        left: 22,
        top: 24
    },
    menuItemView: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginBottom: 18,
        flex: 1,
        paddingLeft: 10,
        paddingRight: 10,
    },
    viewIcon: {
        width: 30,
        height: 30,
        borderRadius: 0,
        justifyContent: 'center',
        alignItems: 'center',
        color: colors.BLACK,
        left: 1
    },
    menuName: {
        color: colors.BLACK,
        fontWeight: 'normal',
        marginLeft: 8,
        width: "100%"
    },
    mainViewStyle: {
        backgroundColor: colors.GREY.default,
        height: '100%',
    },
    compViewStyle: {
        position: 'relative',
        flex: 3
    },
    iconStyle: {
        justifyContent: 'center',
        alignItems: 'center'
    },

})
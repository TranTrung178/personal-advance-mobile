import React, { useState, useContext } from "react";
import { View, Text, TextInput, Pressable, Image, Alert, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { UserType } from "../context/UserContext";

const EditAccountScreen = ({ route, navigation }) => {
    const { user } = route.params;
    const { userId, token } = useContext(UserType);
    const [fullname, setFullname] = useState(user.fullname);
    const [email, setEmail] = useState(user.email);
    const [phone, setPhone] = useState(user.phone || "");
    const [avatar, setAvatar] = useState(user.avatar || null);
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            uploadImageToCloudinary(result.assets[0].uri);
        }
    };

    const uploadImageToCloudinary = async (imageUri) => {
        setLoading(true);
        let formData = new FormData();
        formData.append("file", {
            uri: imageUri,
            type: "image/jpeg",
            name: "profile.jpg",
        });
        formData.append("upload_preset", "your_preset_here");

        try {
            let response = await fetch("https://api.cloudinary.com/v1_1/your_cloudinary_name/image/upload", {
                method: "POST",
                body: formData,
            });
            let data = await response.json();
            setAvatar(data.secure_url);
        } catch (error) {
            Alert.alert("Lỗi", "Không thể tải ảnh lên Cloudinary.");
        }
        setLoading(false);
    };

    const sendOtp = async () => {
        try {
            await axios.post("http://192.168.1.121:8080/api/v1/auth/send-otp", { email });
            Alert.alert("OTP đã được gửi!", "Vui lòng kiểm tra email của bạn.");
        } catch (error) {
            Alert.alert("Lỗi", "Không thể gửi OTP.");
        }
    };

    const updateProfile = async () => {
        if (!fullname || !email || !phone) {
            Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin.");
            return;
        }

        setLoading(true);
        try {
            await axios.put(
                `http://192.168.1.121:8080/api/v1/auth/update-user/${userId}`,
                { fullname, email, phone, avatar },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            Alert.alert("Thành công!", "Thông tin đã được cập nhật.");
            navigation.replace("Main");
        } catch (error) {
            Alert.alert("Lỗi", "Cập nhật thất bại.");
        }
        setLoading(false);
    };

    return (
        <View style={{ padding: 20 }}>
            <Pressable onPress={pickImage}>
                <Image source={{ uri: avatar || "https://via.placeholder.com/100" }} style={{ width: 100, height: 100, borderRadius: 50 }} />
            </Pressable>

            <TextInput value={fullname} onChangeText={setFullname} placeholder="Họ và tên" style={{ borderBottomWidth: 1, marginBottom: 10 }} />
            <TextInput value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" style={{ borderBottomWidth: 1, marginBottom: 10 }} />
            <TextInput value={phone} onChangeText={setPhone} placeholder="Số điện thoại" keyboardType="phone-pad" style={{ borderBottomWidth: 1, marginBottom: 10 }} />

            <Pressable onPress={sendOtp} style={{ backgroundColor: "#FFA500", padding: 10, borderRadius: 5, marginBottom: 10 }}>
                <Text style={{ textAlign: "center", color: "#fff" }}>Gửi OTP</Text>
            </Pressable>

            <Pressable onPress={updateProfile} style={{ backgroundColor: "#007bff", padding: 10, borderRadius: 5 }}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ textAlign: "center", color: "#fff" }}>Cập nhật</Text>}
            </Pressable>
        </View>
    );
};

export default EditAccountScreen;

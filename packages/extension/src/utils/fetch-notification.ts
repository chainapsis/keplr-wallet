import { NotyphiTopic } from "@notificationTypes";
import axios from "axios";
import { NOTYPHI_BASE_URL } from "../config.ui.var";

export const fetchOrganisations = async () => {
  return await axios
    .get(`${NOTYPHI_BASE_URL}/organisations?page=1&size=50`)
    .then((res) => res.data)
    .catch((err) => console.log(err));
};

export const fetchFollowedOrganisations = async (walletAddress: string) => {
  const headers = {
    "x-wallet-address": walletAddress,
  };
  return await axios
    .get(`${NOTYPHI_BASE_URL}/profile/following`, {
      headers: headers,
    })
    .then((res) => res.data)
    .catch((err) => console.log(err));
};

export const followOrganisation = async (
  walletAddress: string,
  orgId: string
) => {
  const headers = {
    "x-wallet-address": walletAddress,
  };

  return await axios
    .post(`${NOTYPHI_BASE_URL}/notifications/${orgId}/follow`, "", {
      headers: headers,
    })
    .then((response) => response.data)
    .catch((err) => console.log(err));
};

export const unfollowOrganisation = async (
  walletAddress: string,
  orgId: string
) => {
  const headers = {
    "x-wallet-address": walletAddress,
  };

  return await axios
    .get(`${NOTYPHI_BASE_URL}/notifications/${orgId}/unfollow`, {
      headers: headers,
    })
    .then((response) => response.data)
    .catch((err) => console.log(err));
};

export const fetchTopics = async () => {
  return await axios
    .get(`${NOTYPHI_BASE_URL}/tags?page=1&size=50`)
    .then((res) => res.data)
    .catch((err) => console.log(err));
};

export const fetchAllNotifications = async (walletAddress: string) => {
  const headers = {
    "x-wallet-address": walletAddress,
  };

  /// fetch notification topics from db
  const topics: NotyphiTopic[] = JSON.parse(
    localStorage.getItem(`topics-${walletAddress}`) || JSON.stringify([])
  );

  const data = {
    timezone: 0,
    categories: [],
    tags: topics.map((topic) => topic.name),
  };
  return await axios
    .post(`${NOTYPHI_BASE_URL}/notifications`, data, {
      headers: headers,
    })
    .then((res) => res.data)
    .catch((err) => console.log(err));
};

export const markDeliveryAsRead = async (
  deliveryId: string,
  walletAddress: string
) => {
  const headers = {
    "x-wallet-address": walletAddress,
  };

  const data = {
    timezone: 0,
    categories: [],
    tags: ["Fetch.ai"],
  };

  return await axios
    .post(`${NOTYPHI_BASE_URL}/notifications/${deliveryId}/read`, data, {
      headers: headers,
    })
    .then((response) => response.data)
    .catch((error) => console.log(error));
};

export const markDeliveryAsRejected = async (
  deliveryId: string,
  walletAddress: string
) => {
  const headers = {
    "x-wallet-address": walletAddress,
  };

  return await axios
    .post(`${NOTYPHI_BASE_URL}/notifications/${deliveryId}/rejected`, "", {
      headers: headers,
    })
    .then((response) => response.data)
    .catch((error) => console.log(error));
};

export const markDeliveryAsClicked = async (
  deliveryId: string,
  walletAddress: string
) => {
  const headers = {
    "x-wallet-address": walletAddress,
  };

  return await axios
    .post(`${NOTYPHI_BASE_URL}/notifications/${deliveryId}/clicked`, "", {
      headers: headers,
    })
    .then((response) => response.data)
    .catch((error) => console.log(error));
};

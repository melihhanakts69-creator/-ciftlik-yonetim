import React from 'react';
import { FaLeaf } from 'react-icons/fa';
import ChatSistemi from '../common/ChatSistemi';

export default function YemDanismani() {
    return <ChatSistemi type="yem" title="Yem & Rasyon Danışmanı (Ziraat AI)" icon={<FaLeaf />} />;
}

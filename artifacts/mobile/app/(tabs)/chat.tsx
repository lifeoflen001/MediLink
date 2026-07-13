import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useChat, type ChatMessage } from '@/context/ChatContext';
import { QUICK_SUGGESTIONS } from '@/data/mockData';

function MessageBubble({ message, colors }: { message: ChatMessage; colors: ReturnType<typeof useColors> }) {
  const isUser = message.role === 'user';
  return (
    <View style={[styles.bubbleWrapper, isUser ? styles.bubbleRight : styles.bubbleLeft]}>
      {!isUser && (
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Ionicons name="medical" size={13} color="#fff" />
        </View>
      )}
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: isUser ? colors.primary : colors.card,
            borderColor: isUser ? colors.primary : colors.border,
            borderBottomRightRadius: isUser ? 4 : 18,
            borderBottomLeftRadius: isUser ? 18 : 4,
          },
        ]}
      >
        <Text
          style={[
            styles.bubbleText,
            { color: isUser ? colors.primaryForeground : colors.foreground },
          ]}
        >
          {message.content}
        </Text>
        <Text
          style={[
            styles.bubbleTime,
            { color: isUser ? 'rgba(255,255,255,0.6)' : colors.mutedForeground },
          ]}
        >
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );
}

function TypingIndicator({ colors }: { colors: ReturnType<typeof useColors> }) {
  return (
    <View style={styles.bubbleLeft}>
      <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
        <Ionicons name="medical" size={13} color="#fff" />
      </View>
      <View style={[styles.bubble, { backgroundColor: colors.card, borderColor: colors.border, borderBottomLeftRadius: 4 }]}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    </View>
  );
}

export default function ChatScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const { messages, isStreaming, sendMessage, clearChat } = useChat();
  const [inputText, setInputText] = useState('');
  const listRef = useRef<FlatList>(null);

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || isStreaming) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setInputText('');
    await sendMessage(text);
  }, [inputText, isStreaming, sendMessage]);

  const handleSuggestion = useCallback((suggestion: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    sendMessage(suggestion);
  }, [sendMessage]);

  const showTypingIndicator = isStreaming && messages[0]?.role === 'assistant' && messages[0]?.content === '';

  return (
    <View style={[styles.container, { backgroundColor: colors.chatBackground }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: topPad + 10, backgroundColor: colors.primary },
        ]}
      >
        <View style={styles.headerContent}>
          <View style={[styles.headerAvatar, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <Ionicons name="medical" size={20} color="#fff" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>MediConnect AI</Text>
            <View style={styles.onlineBadge}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Online • Healthcare Assistant</Text>
            </View>
          </View>
          <TouchableOpacity onPress={clearChat} style={styles.clearBtn}>
            <Ionicons name="trash-outline" size={20} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        keyboardVerticalOffset={0}
      >
        {/* Messages */}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={item => item.id}
          inverted
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            showTypingIndicator ? <TypingIndicator colors={colors} /> : null
          }
          ListFooterComponent={
            messages.length === 1 ? (
              <View style={styles.suggestionsContainer}>
                <Text style={[styles.suggestionsLabel, { color: colors.mutedForeground }]}>
                  Try asking...
                </Text>
                {QUICK_SUGGESTIONS.map(s => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => handleSuggestion(s)}
                    style={[styles.suggestionChip, { backgroundColor: colors.card, borderColor: colors.border }]}
                  >
                    <Ionicons name="chatbubble-outline" size={14} color={colors.primary} />
                    <Text style={[styles.suggestionText, { color: colors.foreground }]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null
          }
          renderItem={({ item }) => <MessageBubble message={item} colors={colors} />}
        />

        {/* Input bar */}
        <View
          style={[
            styles.inputBar,
            {
              backgroundColor: colors.card,
              borderTopColor: colors.border,
              paddingBottom: bottomPad > 0 ? bottomPad : 16,
            },
          ]}
        >
          <View style={[styles.inputWrapper, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask about medicines or symptoms..."
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { color: colors.foreground }]}
              multiline
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={handleSend}
            />
          </View>
          <TouchableOpacity
            onPress={handleSend}
            disabled={!inputText.trim() || isStreaming}
            style={[
              styles.sendBtn,
              {
                backgroundColor:
                  inputText.trim() && !isStreaming ? colors.primary : colors.muted,
              },
            ]}
          >
            {isStreaming ? (
              <ActivityIndicator size="small" color={colors.mutedForeground} />
            ) : (
              <Ionicons
                name="send"
                size={18}
                color={inputText.trim() ? '#fff' : colors.mutedForeground}
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 14 },
  headerContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  onlineBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#4ADE80' },
  onlineText: { fontSize: 11, color: 'rgba(255,255,255,0.75)' },
  clearBtn: { padding: 6 },

  messageList: { paddingHorizontal: 16, paddingVertical: 12, gap: 12, flexGrow: 1 },

  bubbleWrapper: { flexDirection: 'row', gap: 8, maxWidth: '85%' },
  bubbleLeft: { flexDirection: 'row', gap: 8, alignSelf: 'flex-start', maxWidth: '85%' },
  bubbleRight: { alignSelf: 'flex-end' },
  avatar: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 4, flexShrink: 0 },
  bubble: { padding: 12, borderRadius: 18, borderWidth: 1, gap: 4, flexShrink: 1 },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  bubbleTime: { fontSize: 10, alignSelf: 'flex-end' },

  suggestionsContainer: { paddingVertical: 16, gap: 8 },
  suggestionsLabel: { fontSize: 12, fontWeight: '600', textAlign: 'center', marginBottom: 4 },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  suggestionText: { fontSize: 14, flex: 1 },

  inputBar: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, gap: 10, flexDirection: 'row', alignItems: 'flex-end' },
  inputWrapper: { flex: 1, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1, maxHeight: 100 },
  input: { fontSize: 15, padding: 0, maxHeight: 80 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});

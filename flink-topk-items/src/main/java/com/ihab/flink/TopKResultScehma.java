package com.example.flink;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.flink.api.common.serialization.SerializationSchema;

import java.io.IOException;

/**
 * Serialization schema for TopKResult objects.
 */
public class TopKResultSchema implements SerializationSchema<TopKResult> {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public byte[] serialize(TopKResult element) {
        try {
            // Convert the TopKResult object to a JSON byte array
            return objectMapper.writeValueAsBytes(element);
        } catch (IOException e) {
            throw new RuntimeException("Failed to serialize TopKResult", e);
        }
    }
}

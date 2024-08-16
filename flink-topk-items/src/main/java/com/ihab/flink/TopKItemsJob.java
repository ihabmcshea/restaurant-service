package com.ihab.flink;

import org.apache.flink.api.common.functions.MapFunction;
import org.apache.flink.api.common.serialization.SimpleStringSchema;
import org.apache.flink.streaming.api.datastream.DataStream;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;
import org.apache.flink.streaming.connectors.kafka.FlinkKafkaConsumer;
import org.apache.flink.streaming.connectors.kafka.FlinkKafkaProducer;
import org.apache.flink.streaming.api.windowing.time.Time;
import org.apache.flink.streaming.api.windowing.assigners.TumblingProcessingTimeWindows;
import org.apache.flink.streaming.api.functions.KeyedProcessFunction;
import org.apache.flink.util.Collector;
import org.apache.flink.api.common.state.ValueState;
import org.apache.flink.api.common.state.ValueStateDescriptor;
import java.util.HashMap;
import java.util.Map;
import java.util.PriorityQueue;
import java.util.Comparator;
import java.util.Properties;
import java.util.ArrayList;

public class TopKItemsJob {

    public static void main(String[] args) throws Exception {
        final StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();

        // Kafka Consumer
        Properties kafkaProps = new Properties();
        kafkaProps.setProperty("bootstrap.servers", "localhost:9092");
        kafkaProps.setProperty("group.id", "order-group");

        FlinkKafkaConsumer<String> consumer = new FlinkKafkaConsumer<>("orders", new SimpleStringSchema(), kafkaProps);
        DataStream<String> ordersStream = env.addSource(consumer);

        DataStream<ItemOrder> parsedOrders = ordersStream.map(new MapFunction<String, ItemOrder>() {
            @Override
            public ItemOrder map(String value) {
                // Parse the JSON or CSV string to ItemOrder object
                return parseOrder(value);
            }
        });

        // Aggregate orders by item
        DataStream<ItemAggregate> aggregatedItems = parsedOrders
            .keyBy(order -> order.getItemId())
            .timeWindow(Time.hours(1))
            .aggregate(new ItemAggregator());

        // Maintain top K items
        DataStream<TopKResult> topKItems = aggregatedItems
            .keyBy(ignored -> 0)
            .process(new TopKItemsProcessFunction(10)); // Top 10 items

        // Kafka Producer
        FlinkKafkaProducer<TopKResult> producer = new FlinkKafkaProducer<>(
            "top-k-items",
            new TopKResultSchema(),
            kafkaProps
        );

        topKItems.addSink(producer);

        env.execute("Top K Items Job");
    }

    private static ItemOrder parseOrder(String value) {
 ObjectMapper objectMapper = new ObjectMapper();
    try {
        return objectMapper.readValue(value, ItemOrder.class);
    } catch (Exception e) {
        e.printStackTrace();
        return null;
    }
    }
}

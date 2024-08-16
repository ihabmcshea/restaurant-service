# Use the official Flink base image
FROM flink:1.15.0-scala_2.12

RUN mvn clean package

# Set the working directory
WORKDIR /opt/flink

# Copy the JAR file into the container
COPY target/flink-topk-items-1.0-SNAPSHOT.jar /opt/flink/lib/

# Run the Flink job
ENTRYPOINT ["flink", "run", "/opt/flink/lib/flink-topk-items-1.0-SNAPSHOT.jar"]

# REGISTRY_MIRROR lets us pull base images through a mirror. Default empty = Docker Hub.
ARG REGISTRY_MIRROR=
FROM ${REGISTRY_MIRROR}maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
# Aliyun Maven mirror for China networks (see settings.xml).
COPY settings.xml .
RUN mvn -q -s settings.xml dependency:go-offline
COPY src ./src
RUN mvn -q -s settings.xml package -DskipTests

ARG REGISTRY_MIRROR=
FROM ${REGISTRY_MIRROR}eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/market-api-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]

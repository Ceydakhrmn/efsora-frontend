# Build stage
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY backend/pom.xml .
COPY backend/src ./src
RUN apt-get update && apt-get install -y maven && mvn package -DskipTests

# Run stage
FROM eclipse-temurin:21-jre
WORKDIR /app
<<<<<<< HEAD
COPY --from=build /app/target/demo-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
=======

COPY backend/target/demo-0.0.1-SNAPSHOT.jar /app/app.jar

EXPOSE 8081
>>>>>>> 557fad4 (Bugünkü yapılan tüm değişiklikler)
ENTRYPOINT ["java", "-jar", "/app/app.jar"]

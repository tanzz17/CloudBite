FROM eclipse-temurin:17-jdk as build
WORKDIR /app
COPY . .
RUN chmod +x ./mvnw && ./mvnw clean package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar /app/app.jar
ENV PORT=10000
EXPOSE 10000
CMD ["java","-jar","/app/app.jar"]

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["./src/ProductosApp.Api/ProductosApp.Api.csproj", "./src/ProductosApp.Api/"]
RUN dotnet restore "./src/ProductosApp.Api/ProductosApp.Api.csproj"

COPY . ./
RUN dotnet publish "./src/ProductosApp.Api/ProductosApp.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 5033
ENTRYPOINT ["dotnet", "ProductosApp.Api.dll"]

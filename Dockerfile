FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY backend/TargetDesafio.Api/TargetDesafio.Api.csproj backend/TargetDesafio.Api/
RUN dotnet restore backend/TargetDesafio.Api/TargetDesafio.Api.csproj
COPY backend/TargetDesafio.Api/ backend/TargetDesafio.Api/
RUN dotnet publish backend/TargetDesafio.Api/TargetDesafio.Api.csproj -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app .
ENV ASPNETCORE_URLS=http://0.0.0.0:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "TargetDesafio.Api.dll"]

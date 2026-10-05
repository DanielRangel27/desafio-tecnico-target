FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY TargetDesafio.Api/TargetDesafio.Api.csproj TargetDesafio.Api/
RUN dotnet restore TargetDesafio.Api/TargetDesafio.Api.csproj
COPY TargetDesafio.Api/ TargetDesafio.Api/
RUN dotnet publish TargetDesafio.Api/TargetDesafio.Api.csproj -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app .
ENV ASPNETCORE_URLS=http://0.0.0.0:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "TargetDesafio.Api.dll"]

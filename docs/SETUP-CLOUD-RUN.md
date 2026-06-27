# Setup: Deploy automático a Google Cloud Run

Guía para configurar el deploy automático desde GitHub a Cloud Run.

## Tiempo estimado: 10 minutos

## Paso 1: Crear proyecto en Google Cloud

1. Ve a https://console.cloud.google.com
2. Click en el selector de proyectos (arriba) → **"New Project"**
3. Nombre: `soat-manager` (o el que quieras)
4. Click **"Create"**
5. Asegúrate de que el proyecto esté seleccionado

## Paso 2: Habilitar APIs

En la consola de Google Cloud, abre el **Cloud Shell** (icono `>_` arriba a la derecha) y ejecuta:

```bash
gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com
```

## Paso 3: Crear repositorio en Artifact Registry

```bash
gcloud artifacts repositories create soat-manager \
  --repository-format=docker \
  --location=us-central1 \
  --description="Docker images para SOAT Manager"
```

## Paso 4: Crear Service Account para GitHub Actions

```bash
# Crear la cuenta de servicio
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions Deploy"

# Obtener el email (lo necesitas para el siguiente comando)
SA_EMAIL="github-actions@$(gcloud config get-value project).iam.gserviceaccount.com"

# Asignar permisos
gcloud projects add-iam-policy-binding $(gcloud config get-value project) \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding $(gcloud config get-value project) \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/artifactregistry.writer"

gcloud projects add-iam-policy-binding $(gcloud config get-value project) \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/iam.serviceAccountUser"

# Generar la key JSON
gcloud iam service-accounts keys create key.json --iam-account=$SA_EMAIL

# Mostrar la key (copiar TODO el contenido)
cat key.json
```

## Paso 5: Configurar secrets en GitHub

1. Ve a tu repo: https://github.com/AlberthSanchez-DigitalprofIT/soat-manager
2. Settings → Secrets and variables → Actions → **"New repository secret"**
3. Crea estos 2 secrets:

| Nombre | Valor |
|--------|-------|
| `GCP_PROJECT_ID` | El ID de tu proyecto (ej: `soat-manager-12345`) |
| `GCP_SA_KEY` | El contenido completo del archivo `key.json` del paso anterior |

## Paso 6: Push para activar el deploy

```bash
cd soat-manager
git add .
git commit -m "ci: deploy automático a Cloud Run"
git push
```

GitHub Actions se activa automáticamente y despliega a Cloud Run.

## Paso 7: Obtener la URL

Después del deploy exitoso, la URL aparece en:
- La consola de Cloud Run: https://console.cloud.google.com/run
- O en los logs del GitHub Action

La URL será algo como: `https://soat-manager-xxxxx-uc.a.run.app`

## Costos (free tier)

| Recurso | Free tier | Tu uso estimado |
|---------|-----------|-----------------|
| Requests | 2M/mes | ~100/mes |
| CPU | 180,000 vCPU-seconds | ~500/mes |
| Memory | 360,000 GB-seconds | ~1000/mes |
| Networking | 1 GB egress | ~100MB/mes |

**Costo esperado: $0/mes** (muy por debajo de los límites gratuitos)

## Notas

- `min-instances: 0` = el servicio escala a cero cuando no hay tráfico (no cobra). Tarda ~5s en despertar.
- Si quieres 0 latencia: cambia a `min-instances: 1` (cobra ~$5/mes por mantener 1 instancia activa 24/7)
- Cloud Run soporta hasta 300s de timeout por request (suficiente para descargar varios SOATs)

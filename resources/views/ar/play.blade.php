<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{{ $content->title }} - AR Camera</title>
    <!-- A-Frame -->
    <script src="https://aframe.io/releases/1.5.0/aframe.min.js"></script>
    <!-- MindAR for A-Frame -->
    <script src="https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-aframe.prod.js"></script>
    <style>
      body { margin: 0; overflow: hidden; background-color: #000; }
      .back-btn {
        position: absolute;
        top: 20px;
        left: 20px;
        z-index: 1000;
        background: rgba(0, 0, 0, 0.6);
        color: white;
        padding: 12px 24px;
        border-radius: 12px;
        text-decoration: none;
        font-family: 'Nunito', sans-serif;
        font-weight: 700;
        font-size: 14px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(4px);
      }
      .guide-text {
        position: absolute;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 1000;
        background: rgba(0, 0, 0, 0.6);
        color: white;
        padding: 10px 20px;
        border-radius: 20px;
        font-family: 'Nunito', sans-serif;
        font-size: 14px;
        text-align: center;
        border: 1px solid rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(4px);
        width: 80%;
        max-width: 400px;
      }
    </style>
  </head>
  <body>
    <a href="{{ route('ar.show', $content->id) }}" class="back-btn">
      &larr; Kembali
    </a>
    
    <div class="guide-text">
      Arahkan kamera ke gambar marker untuk memunculkan model 3D.
    </div>
    
    <a-scene mindar-image="imageTargetSrc: https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.5/examples/image-tracking/assets/card-example/card.mind;" 
             color-space="sRGB" 
             renderer="colorManagement: true, physicallyCorrectLights" 
             vr-mode-ui="enabled: false" 
             device-orientation-permission-ui="enabled: false">
      
      <a-assets>
        @foreach($content->models as $index => $model)
          @if(in_array(strtolower($model->file_type), ['glb', 'gltf']))
            <a-asset-item id="model-{{ $model->id }}" src="{{ $model->file_url }}"></a-asset-item>
          @endif
        @endforeach
      </a-assets>

      <a-camera position="0 0 0" look-controls="enabled: false"></a-camera>

      <a-entity mindar-image-target="targetIndex: 0">
        @foreach($content->models as $index => $model)
          @if(in_array(strtolower($model->file_type), ['glb', 'gltf']))
            <a-gltf-model 
              src="#model-{{ $model->id }}"
              position="{{ $model->position_x }} {{ $model->position_y }} {{ $model->position_z }}"
              rotation="{{ $model->rotation_x }} {{ $model->rotation_y }} {{ $model->rotation_z }}"
              scale="{{ $model->scale_x }} {{ $model->scale_y }} {{ $model->scale_z }}">
            </a-gltf-model>
          @endif
        @endforeach
      </a-entity>
    </a-scene>
  </body>
</html>

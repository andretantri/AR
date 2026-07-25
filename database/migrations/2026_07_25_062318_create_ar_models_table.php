<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('ar_models', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ar_content_id')->constrained()->cascadeOnDelete();
            $table->string('name')->nullable(); // Optional name for the model
            $table->string('file_path');
            $table->string('file_name');
            $table->string('file_type')->default('glb');
            $table->bigInteger('file_size')->default(0);
            
            // Layout fields
            $table->float('position_x')->default(0);
            $table->float('position_y')->default(0);
            $table->float('position_z')->default(0);
            $table->float('rotation_x')->default(0);
            $table->float('rotation_y')->default(0);
            $table->float('rotation_z')->default(0);
            $table->float('scale_x')->default(1);
            $table->float('scale_y')->default(1);
            $table->float('scale_z')->default(1);
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ar_models');
    }
};

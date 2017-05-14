/*!
 * @class GstLaunch
 * @brief Class that encapsulates "gst-launch" executable.
 */
function GstLaunch() {
	
	const gst_launch_executable = 'gst-launch-1.0';
	const gst_launch_versionarg = '--version';
	
	const SpawnSync = require('child_process').spawnSync;
	const Spawn = require('child_process').spawn;
	const Assert = require('assert');
	const Path = require('path');
	const OS = require('os');
	const FS = require('fs');
	
	/*!
	 * @fn getPath
	 * @brief Returns path to gst-launch or undefined on error
	 */
	var getPath = function() {
		var detected_path = undefined;
		
		if (OS.platform() == 'win32') {
			// On Windows, GStreamer MSI installer defines the following
			// environment variables.
			const detected_path_x64 = process.env.GSTREAMER_1_0_ROOT_X86_64;
			const detected_path_x32 = process.env.GSTREAMER_1_0_ROOT_X86;
			if (detected_path_x64 || detected_path_x32) {
				// If both variables are present, favor the architecture
				// of GStreamer which is the same as Node.js runtime.
				if (detected_path_x64 && detected_path_x32) {
					if (process.arch == 'x64')
						detected_path = detected_path_x64;
					else if (process.arch == 'x32')
						detected_path = detected_path_x32;
				} else {
					detected_path = detected_path_x64 || detected_path_x32;
				}
			}
			
			if (detected_path) {
				detected_path = Path.join(
					detected_path,
					'bin',
					(gst_launch_executable + '.exe'));
				try { FS.accessSync(detected_path, FS.F_OK); }
				catch (e) { detected_path = undefined; }
			} else {
				// Look for GStreamer on PATH
				var path_dirs = process.env.PATH.split(';');
				for (var index = 0; index < path_dirs.length; ++index) {
					try {
						var base = Path.normalize(path_dirs[index]);
						var bin = Path.join(
							base,
							(gst_launch_executable + '.exe'));
						FS.accessSync(bin, FS.F_OK);
						detected_path = bin;
					} catch (e) { /* no-op */ }
				}
			}
		} else if (OS.platform() == 'linux') {
			// Look for GStreamer on PATH
			var path_dirs = process.env.PATH.split(':');
			for (var index = 0; index < path_dirs.length; ++index) {
				try {
					var base = Path.normalize(path_dirs[index]);
					var bin = Path.join(
						base,
						gst_launch_executable);
					FS.accessSync(bin, FS.F_OK);
					detected_path = bin;
				} catch (e) { /* no-op */ }
			}
		}
		
		return detected_path;
	}
	
	/*!
	 * @fn getVersion
	 * @brief Returns version string of GStreamer on this machine by
	 * invoking the gst-launch executable or 'undefined' on failure.
	 */
	var getVersion = function() {
		var version_str = undefined;
		try {
			var gst_launch_path = getPath();
			Assert.ok(typeof(gst_launch_path), 'string');
			console.log(gst_launch_path);
			var output = SpawnSync(
					gst_launch_path,
					[gst_launch_versionarg],
					{ 'timeout' : 1000 })
				.stdout;
			
			if (output && output.toString().includes('GStreamer')) {
				version_str = output
					.toString()
					.match(/GStreamer\s+.+/g)[0]
					.replace(/GStreamer\s+/,'');
			}
		}
		catch(ex) {
			version_str = undefined;
		}
		
		return version_str;
	}
	
	/*!
	 * @fn isAvailable
	 * @brief Answers true if gst-launch executable is available
	 */
	var isAvailable = function() {
		return getVersion() != undefined;
	}
	
	/*!
	 * @fn spawnPipeline
	 * @brief Spawns a GStreamer pipeline using gst-launch
	 * @return A Node <child-process> of the launched pipeline
	 * @see To construct a correct pipeline arg, consult the link below:
	 * https://gstreamer.freedesktop.org/data/doc/gstreamer/head/manual/html/chapter-programs.html
	 * @usage spawnPipeline('videotestsrc ! autovideosink')
	 */
	var spawnPipeline = function(pipeline) {
		Assert.ok(typeof(pipeline), 'string');
		Assert.ok(isAvailable(), "gst-launch is not available.");
		
		var gst_launch_path = getPath();
		Assert.ok(typeof(gst_launch_path), 'string');
			
		return Spawn(gst_launch_path, pipeline.split(' '));
	}
	
	return {
		'getPath' : getPath,
		'getVersion' : getVersion,
		'isAvailable' : isAvailable,
		'spawnPipeline' : spawnPipeline
	}
	
}

/*!
 * @class GstLiveCamServer
 * @brief Encapsulates a GStreamer pipeline to broadcast default webcam.
 */
function GstLiveCamServer(config) {
	
	const Assert = require('assert');
	const OS = require('os');
	
	Assert.ok(OS.platform() == 'win32' || OS.platform() == 'linux',
	"livecam module supports Windows and Linux for broadcasting.");
	
	config = config || {};
	Assert.ok(typeof(config), 'object');
	
	const fake = config.fake || false;
	const width = config.width || 0;
	const height = config.height || 0;
	const framerate = config.framerate || 0;
	const grayscale = config.grayscale || false;
	
	Assert.ok(typeof(fake), 'boolean');
	Assert.ok(typeof(width), 'number');
	Assert.ok(typeof(height), 'number');
	Assert.ok(typeof(framerate), 'number');
	Assert.ok(typeof(grayscale), 'boolean');
	
	var gst_multipart_boundary = '--videoboundary';
	var gst_video_src = '';
	
	if (!fake) {
		if (OS.platform() == 'win32')
			gst_video_src = 'ksvideosrc ! decodebin';
		else if (OS.platform() == 'linux')
			gst_video_src = 'v4l2src ! decodebin';
		else
			gst_video_src = 'videotestsrc';
	} else {
		gst_video_src = 'videotestsrc';
	}
	
	if (width > 0 || height > 0) {
		gst_video_src += ' ! videoscale ! video/x-raw,width=' + parseInt(width) + ',height=' + parseInt(height);
	}
	
	if (framerate > 0) {
		gst_video_src += ' ! videorate ! video/x-raw,framerate=' + parseInt(framerate) + '/1';
	}
	
	if (grayscale) {
		gst_video_src += ' ! videobalance saturation=0.0 ! videoconvert';
	}
	
	/*!
	 * @fn start
	 * @brief Starts a GStreamer pipeline that broadcasts the default
	 * webcam over the given TCP address and port.
	 * @return A Node <child-process> of the launched pipeline
	 */
	var start = function(tcp_addr, tcp_port) {
		Assert.ok(typeof(tcp_addr), 'string');
		Assert.ok(typeof(tcp_port), 'number');
		
		const cam_pipeline = gst_video_src + ' ! jpegenc ! multipartmux  boundary="'
		+ gst_multipart_boundary + '" ! tcpserversink host=' + tcp_addr + ' port=' + tcp_port;
		
		var gst_launch = new GstLaunch();
		
		if (gst_launch.isAvailable()) {
			console.log('GstLaunch found: ' + gst_launch.getPath());
			console.log('GStreamer version: ' + gst_launch.getVersion());
			console.log('GStreamer pipeline: ' + cam_pipeline);
			
			return gst_launch.spawnPipeline(cam_pipeline);
		} else {
			throw new Error('GstLaunch not found.');
		}
	}
	
	return {
		'start' : start
	}
	
}

/*!
 * @class SocketCamWrapper
 * @brief A wrapper that re-broadcasts GStreamer's webcam TCP packets in
 * Socket.IO events. This way browsers can fetch and understand webcam
 * video frames.
 * @credit http://stackoverflow.com/a/23605892/388751
 */
function SocketCamWrapper() {

	const Net = require('net');
	const Http = require('http');
	const Dicer = require('dicer');
	const Assert = require('assert');
	const SocketIO = require('socket.io');
	const gst_multipart_boundary = '--videoboundary';

	var socket = undefined;
	var io = undefined;
	var dicer = undefined;
	
	/*!
	 * @fn wrap
	 * @brief wraps a TCP server previously started by GstLiveCamServer.
	 */
	var wrap = function(gst_tcp_addr,
						gst_tcp_port,
						imageEmitCallback) {

		Assert.ok(typeof(gst_tcp_addr), 'string');
		Assert.ok(typeof(gst_tcp_port), 'number');
		Assert.ok(typeof(imageEmitCallback), 'function');

		socket = Net.Socket();
		
		socket.connect(gst_tcp_port, gst_tcp_addr, function() {
			
			dicer = new Dicer({ boundary: gst_multipart_boundary });

			dicer.on('part', function(part) {
				var frameEncoded = '';
				part.setEncoding('base64');

				part.on('data', function(data) { frameEncoded += data; });
				part.on('end', function() { imageEmitCallback( frameEncoded ) });
				part.on('error', function() { console.log('Part errored'); });
			});

			dicer.on('finish', function() {
				console.log('Dicer finished: ');
			});

			dicer.on('error', function() {
				console.log('Dicer errored: ');
			});
			
			socket.on('close', function() {
				console.log('Socket closed: ');
			});

			socket.pipe(dicer);
		});
	}
		
	

	var close = function() {
			socket.end();
	}
	
	return {
		'wrap' : wrap,
		'close' : close
	}
}

/*!
 * @class LiveCam
 * @brief starts a livecam server at given config params
 * @note config can have the following options:
 * config.gst_tcp_addr --> where GStreamer TCP socket host is
 *    [optional] [default: 127.0.0.1]
 * config.gst_tcp_port --> where GStreamer TCP socket port is
 *    [optional] [default: 10000]
 * config.ui_addr --> where minimal UI host is
 *    [optional] [default: 127.0.0.1]
 * config.ui_port --> where minimal UI port is
 *    [optional] [default: 11000]
 * config.broadcast_addr --> where Socket IO host is (browser-visible)
 *    [optional] [default: 127.0.0.1]
 * config.broadcast_port --> where Socket IO port is (browser-visible)
 *    [optional] [default: 12000]
 * config.start --> event emitted when streaming is started
 *    [optional] [default: null]
 */
function LiveCam(config) {
	
	const Assert = require('assert');
	
	config = config || {};
	Assert.ok(typeof(config), 'object');
	
	const gst_tcp_addr = config.gst_addr || "127.0.0.1";
	const gst_tcp_port = config.gst_port || 10000;
	const start = config.start;
	const imageEmitCallback = config.imageEmitCallback;
	const webcam = config.webcam || {};
	
	if (imageEmitCallback) Assert.ok(typeof(imageEmitCallback), 'function');
	if (start) Assert.ok(typeof(start), 'function');
	if (gst_tcp_port) Assert.ok(typeof(gst_tcp_port), 'number');
	if (gst_tcp_addr) Assert.ok(typeof(gst_tcp_addr), 'string');
	if (webcam) Assert.ok(typeof(webcam), 'object');
	
	if (!(new GstLaunch()).isAvailable())
	{
		console.log("==================================================");
		console.log("Unable to locate gst-launch executable.");
		console.log("Look at https://github.com/sepehr-laal/livecam");
		console.log("You are most likely missing the GStreamer runtime.");
		console.log("==================================================");
		
		throw new Error('Unable to broadcast.');
	}
	
	console.log("LiveCam parameters:", {
		'gst_tcp_addr' : gst_tcp_addr,
		'gst_tcp_port' : gst_tcp_port
	});
	var gst_cam_wrap = undefined;
	var gst_cam_server = undefined;
	var gst_cam_process = undefined;
	
	var startBroadcast = function() {
		gst_cam_wrap = new SocketCamWrapper();
		gst_cam_server = new GstLiveCamServer(webcam);
		gst_cam_process = gst_cam_server.start(gst_tcp_addr, gst_tcp_port);
		
		gst_cam_process.stdout.on('data', function(data) {
			console.log(data.toString());
			//This catches GStreamer when pipeline goes into PLAYING state
			if(data.toString().includes('Setting pipeline to PLAYING') > 0) {
				gst_cam_wrap.wrap(gst_tcp_addr, gst_tcp_port, imageEmitCallback );
				
				if (start) start();
			}
		});

		gst_cam_process.stderr.on('data', function(data) { console.log(data.toString()); /*gst_cam_ui.close();*/ });
		gst_cam_process.on('error', function(err) { console.log("Webcam server error: " + err); /*gst_cam_ui.close();*/ });
		gst_cam_process.on('exit', function(code) { console.log("Webcam server exited: " + code); /*gst_cam_ui.close();*/ });
	}

	var stopBroadcast = function() {
		gst_cam_wrap.close();
		gst_cam_process.kill();
	}

	return {
		'startBroadcast' : startBroadcast,
		'stopBroadcast' : stopBroadcast
	}
	
}

module.exports = LiveCam;
